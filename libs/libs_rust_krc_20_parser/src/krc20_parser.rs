use itertools::Itertools;
use kaspa_addresses::{Address, Prefix};
use kaspa_consensus_core::{
    constants::SOMPI_PER_KASPA,
    tx::{PopulatedTransaction, Transaction, VerifiableTransaction},
};
use kaspa_rpc_core::RpcTransaction;
use kaspa_txscript::{
    extract_script_pub_key_address,
    opcodes::{deserialize_next_opcode, OpCodeImplementation},
};
use kaspa_txscript_errors::TxScriptError;
use serde_json::from_slice;

use crate::model::krc20::TokenTransaction;

pub const FEE_DEPLOY: u64 = 1_000 * SOMPI_PER_KASPA;
pub const FEE_MINT: u64 = SOMPI_PER_KASPA;
pub const PROTOCOL_NAMESPACE: &str = "kasplex";
pub const PROTOCOL_ID: &str = "KRC-20";

pub const KASPLEX_HEADER_LC: [u8; 7] = [107, 97, 115, 112, 108, 101, 120];
pub const KASPLEX_HEADER_UC: [u8; 7] = [75, 65, 83, 80, 76, 69, 88];
pub const KRC20_HEADER_UC: [u8; 6] = [75, 82, 67, 45, 50, 48];
pub const KRC20_HEADER_LC: [u8; 6] = [107, 114, 99, 45, 50, 48];

fn parse_script<T: VerifiableTransaction>(
    script: &[u8],
) -> impl Iterator<Item = std::result::Result<Box<dyn OpCodeImplementation<T>>, TxScriptError>> + '_
{
    script.iter().batching(|it| deserialize_next_opcode(it))
}

pub trait ITransaction {
    fn signature_script(&self) -> Option<&[u8]>;
    fn rcv(&self) -> Address;
}

impl ITransaction for &RpcTransaction {
    fn signature_script(&self) -> Option<&[u8]> {
        Some(&self.inputs[0].signature_script[..])
    }
    fn rcv(&self) -> Address {
        extract_script_pub_key_address(
            &self.outputs[0].script_public_key,
            Prefix::try_from("kaspatest").unwrap(),
        )
        .unwrap()
    }
}

impl ITransaction for &Transaction {
    fn signature_script(&self) -> Option<&[u8]> {
        Some(&self.inputs[0].signature_script[..])
    }
    fn rcv(&self) -> Address {
        extract_script_pub_key_address(
            &self.outputs[0].script_public_key,
            Prefix::try_from("kaspatest").unwrap(),
        )
        .unwrap()
    }
}
impl ITransaction for &Box<RpcTransaction> {
    fn signature_script(&self) -> Option<&[u8]> {
        if self.inputs.is_empty() {
            return None;
        }
        Some(&self.inputs[0].signature_script[..])
    }
    fn rcv(&self) -> Address {
        extract_script_pub_key_address(
            &self.outputs[0].script_public_key,
            Prefix::try_from("kaspatest").unwrap(),
        )
        .unwrap()
    }
}

fn window_find(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    // Ensure we don't start beyond the end of the haystack
    let offset = 10;
    if haystack.len() <= offset {
        return None;
    }

    // Optization: iterate starting from the nth byte
    for (position, window) in haystack[offset..].windows(needle.len()).enumerate() {
        if window == needle {
            return Some(position + offset); // Adjust the position to account for the byte offset
        }
    }
    None
}

pub fn detect_krc20_header(haystack: &[u8]) -> bool {
    window_find(haystack, &KRC20_HEADER_UC).is_some()
        || window_find(haystack, &KRC20_HEADER_LC).is_some()
}

pub fn detect_kasplex_header(haystack: &[u8]) -> bool {
    window_find(haystack, &KASPLEX_HEADER_LC).is_some()
        || window_find(haystack, &KASPLEX_HEADER_UC).is_some()
}

pub fn detect_krc20_receiver<T: ITransaction>(sigtx: T) -> Address {
    sigtx.rcv()
}

pub fn detect_krc20<T: ITransaction>(sigtx: &T) -> Option<TokenTransaction> {
    let mut inscription: Option<TokenTransaction> = None;

    if let Some(signature_script) = sigtx.signature_script() {
        if detect_kasplex_header(signature_script) {
            // Get the second opcode
            let mut opcodes_iter = parse_script(signature_script);
            let second_opcode: Option<
                std::result::Result<
                    Box<dyn OpCodeImplementation<PopulatedTransaction>>,
                    TxScriptError,
                >,
            > = opcodes_iter.nth(1);

            // println!("------------------ {} {}", sigtx.gas(), sigtx.mass());

            match second_opcode {
                Some(Ok(opcode)) => {
                    if !opcode.is_empty()
                        && opcode.is_push_opcode()
                        && detect_krc20_header(opcode.get_data())
                    {
                        let inner_opcodes: Vec<_> =
                            parse_script::<PopulatedTransaction>(opcode.get_data()).collect();
                        if inner_opcodes.len() >= 2 {
                            if let Some(Ok(second_to_last_opcode)) =
                                inner_opcodes.get(inner_opcodes.len() - 2)
                            {
                                match from_slice::<TokenTransaction>(
                                    second_to_last_opcode.get_data(),
                                ) {
                                    Ok(token_transaction) => {
                                        inscription = Some(token_transaction);
                                    }
                                    Err(e) => {
                                        // Handle the error if necessary
                                        eprintln!("Failed to deserialize: {:?}", e);
                                    }
                                }
                            }
                        }
                    }
                }
                Some(Err(e)) => {
                    // Handle the error
                    println!("Error while parsing opcodes: {:?}", e);
                }
                None => {
                    // Handle the case where there are fewer than two opcodes
                    println!("There are fewer than two opcodes in the script.");
                }
            }
        }
    }

    inscription
}

pub struct Krc20Parser {}

impl Krc20Parser {
    pub fn parse_krc_20_operations_from_rpc_txs<T: ITransaction>(
        rpc_txs: &Vec<T>,
    ) -> Vec<TokenTransaction> {
        rpc_txs
            .iter()
            .map(|tx| detect_krc20(tx))
            .filter_map(|token_operation_option| token_operation_option)
            .collect()
    }
}
