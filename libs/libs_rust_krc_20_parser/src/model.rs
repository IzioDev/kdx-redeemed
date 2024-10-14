pub mod krc20 {
    use std::str::FromStr;

    use kaspa_hashes::Hash;
    use serde::{Deserialize, Serialize};
    use serde_with::{serde_as, DisplayFromStr};

    use crate::{error::Error, result::Result};

    #[derive(Debug, Clone, Copy, Eq, PartialEq, Deserialize, Serialize)]
    #[serde(rename_all = "lowercase")]
    pub enum Op {
        Deploy,
        Mint,
        Transfer,
        // Burn,
    }

    impl std::fmt::Display for Op {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            match self {
                Op::Deploy => write!(f, "deploy"),
                Op::Mint => write!(f, "mint"),
                Op::Transfer => write!(f, "transfer"),
            }
        }
    }

    impl FromStr for Op {
        type Err = Error;

        fn from_str(s: &str) -> Result<Self> {
            match s {
                "deploy" => Ok(Op::Deploy),
                "mint" => Ok(Op::Mint),
                "transfer" => Ok(Op::Transfer),
                _ => Err(Error::custom(format!("Invalid KRC20 operation: {}", s))),
            }
        }
    }


    #[serde_as]
    #[derive(Debug, Deserialize, Serialize, PartialEq, Clone)]
    pub struct TokenTransaction {
        pub op: Op,

        pub tick: String,
        #[serde_as(as = "Option<DisplayFromStr>")]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub max: Option<u128>,

        #[serde_as(as = "Option<DisplayFromStr>")]
        #[serde(rename = "lim")]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub limit: Option<u128>,

        #[serde_as(as = "Option<DisplayFromStr>")]
        #[serde(rename = "dec")]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub dec: Option<u64>,

        #[serde_as(as = "Option<DisplayFromStr>")]
        #[serde(rename = "amt")]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub amount: Option<u128>,

        #[serde_as(as = "Option<DisplayFromStr>")]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub pre: Option<u128>,

        #[serde(skip_serializing_if = "Option::is_none")]
        pub from: Option<String>,

        #[serde(skip_serializing_if = "Option::is_none")]
        pub to: Option<String>,

        #[serde_as(as = "Option<DisplayFromStr>")]
        #[serde(rename = "opScore")]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub op_score: Option<u64>,

        #[serde(rename = "hashRev")]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub hash_rev: Option<Hash>,

        #[serde(rename = "feeRev")]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub fee_rev: Option<String>,

        #[serde(rename = "txAccept")]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub tx_accept: Option<String>,

        #[serde(rename = "opAccept")]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub op_accept: Option<String>,

        #[serde(rename = "opError")]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub op_error: Option<String>,

        #[serde(rename = "mtsAdd")]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub mts_add: Option<String>,

        #[serde(rename = "mtsMod")]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub mts_mod: Option<String>,
    }

    impl AsRef<TokenTransaction> for TokenTransaction {
        fn as_ref(&self) -> &TokenTransaction {
            self
        }
    }

    impl TokenTransaction {
        pub fn has_tick<S: std::fmt::Display>(&self, tick: S) -> bool {
            self.tick.to_lowercase() == tick.to_string().to_lowercase()
        }
    }

    #[derive(Deserialize)]
    pub struct TokenTransactionIdResponse {
        pub message: String,
        pub result: Vec<TokenTransaction>,
    }

    pub struct TokenTransactionBuilder {
        op: Op,
        tick: String,
        max: Option<u128>,
        limit: Option<u128>,
        pre: Option<u128>,
        dec: Option<u64>,
        amount: Option<u128>,
        from: Option<String>,
        to: Option<String>,
        op_score: Option<u64>,
        hash_rev: Option<Hash>,
        fee_rev: Option<String>,
        tx_accept: Option<String>,
        op_accept: Option<String>,
        op_error: Option<String>,
        mts_add: Option<String>,
        mts_mod: Option<String>,
    }

    impl TokenTransactionBuilder {
        pub fn new<S: std::fmt::Display>(op: Op, tick: S) -> Self {
            Self {
                op,
                tick: tick.to_string(),
                max: None,
                limit: None,
                pre: None,
                dec: None,
                amount: None,
                from: None,
                to: None,
                op_score: None,
                hash_rev: None,
                fee_rev: None,
                tx_accept: None,
                op_accept: None,
                op_error: None,
                mts_add: None,
                mts_mod: None,
            }
        }

        pub fn max(self, max: u128) -> Self {
            Self {
                max: Some(max),
                ..self
            }
        }

        pub fn amount(self, amount: u128) -> Self {
            Self {
                amount: Some(amount),
                ..self
            }
        }

        pub fn limit(self, limit: u128) -> Self {
            Self {
                limit: Some(limit),
                ..self
            }
        }

        pub fn dec(self, dec: u64) -> Self {
            Self {
                dec: Some(dec),
                ..self
            }
        }

        pub fn build(self) -> TokenTransaction {
            TokenTransaction {
                op: self.op,
                tick: self.tick,
                max: self.max,
                limit: self.limit,
                pre: self.pre,
                dec: self.dec,
                amount: self.amount,
                from: self.from,
                to: self.to,
                op_score: self.op_score,
                hash_rev: self.hash_rev,
                fee_rev: self.fee_rev,
                tx_accept: self.tx_accept,
                op_accept: self.op_accept,
                op_error: self.op_error,
                mts_add: self.mts_add,
                mts_mod: self.mts_mod,
            }
        }
    }
}
