use std::{collections::HashSet, time::Duration};

use kaspa_consensus_core::Hash;
use kaspa_wrpc_client::{
    client::{ConnectOptions, ConnectStrategy},
    prelude::{NetworkId, NetworkType},
    KaspaRpcClient, WrpcEncoding,
};

use kaspa_rpc_core::api::rpc::RpcApi;
use libs_rust_krc_20_parser::krc20_parser::Krc20Parser;

/*
* WIP, intended to eat an archive node from genesis, and initial popupate / fix missed accepted block event
* eventually there would be two app, one up and listening to AcceptedBlock event, and another one to be run aside
* todo: populate influx db with events

* NOTE: work mostly taken from aspectron/sparkle, but needs cleaning / adaptation
*/
#[tokio::main]
async fn main() {
    println!("Hello, world!");

    let kaspa_api = KaspaRpcClient::new(
        WrpcEncoding::Borsh,
        Some("ws://localhost:17210"),
        None,
        Some(NetworkId::with_suffix(NetworkType::Testnet, 10)),
        None,
    )
    .unwrap();

    kaspa_api
        .connect(Some(ConnectOptions {
            block_async_connect: true,
            connect_timeout: Some(Duration::from_secs(5)),
            retry_interval: None,
            strategy: ConnectStrategy::Fallback,
            url: None,
        }))
        .await
        .unwrap();

    let block_dag_info = kaspa_api.get_block_dag_info().await.unwrap();

    let mut last_hash: Hash = block_dag_info.pruning_point_hash;
    let mut hash_set: HashSet<Hash> = HashSet::new();
    let mut finished = false;

    while !finished {
        let blocks = kaspa_api
            .get_blocks(Some(last_hash), true, true)
            .await
            .unwrap();

        blocks.block_hashes.iter().for_each(|hash| {
            if hash_set.contains(hash) && last_hash != *hash {
                panic!("already met {:?}", hash);
            }
            hash_set.insert(hash.to_owned());
        });

        if blocks.block_hashes.len() == 1 && *blocks.block_hashes.first().unwrap() == last_hash {
            println!("finished");
            finished = true;
        }

        let txs: Vec<&kaspa_rpc_core::RpcTransaction> = blocks
            .blocks
            .iter()
            .map(|b| &b.transactions)
            .flatten()
            // remove coinbase tx
            .filter(|tx| tx.inputs.len() > 0)
            .collect();

        let krc20_operations = Krc20Parser::parse_krc_20_operations_from_rpc_txs(&txs);

        if krc20_operations.len() > 0 {
            println!("{:?}", krc20_operations);
        }

        last_hash = blocks.block_hashes.last().unwrap().to_owned();
    }

    println!("{:?}", last_hash);
}
