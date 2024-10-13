use std::env;

use actix_cors::Cors;
use kaspa_consensus_client::{Transaction, TransactionInner};
use kaspa_consensus_core::{network::NetworkType, sign::verify, tx::PopulatedTransaction};
use kaspa_wallet_core::message::{verify_message, PersonalMessage};
use kaspa_wallet_keys::prelude::PublicKey;
use serde::{Deserialize, Serialize};

use actix_web::{post, web, App, Either, HttpResponse, HttpServer};
use serde_json::Error;

#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {
    dotenvy::dotenv().unwrap();

    HttpServer::new(|| {
        App::new()
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_header()
                    .allow_any_method(),
            )
            .service(verify_message_service)
            .service(verify_transaction_service)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

#[derive(Serialize, Deserialize, Debug)]
struct VerifyInputBody {
    message: String,
    public_key: String,
    signature: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct VerifyMessageOutputBody {
    address: String,
    public_key: String,
}

#[post("/message/verify")]
async fn verify_message_service(
    req_body: String,
) -> Either<actix_web::web::Json<VerifyMessageOutputBody>, HttpResponse> {
    let body_result: Result<VerifyInputBody, Error> = serde_json::from_str(&req_body);

    let body = match body_result {
        Ok(body) => body,
        Err(error) => {
            return Either::Right(HttpResponse::BadRequest().body(error.to_string()));
        }
    };

    let pm = PersonalMessage(&body.message);

    let mut signature_bytes = [0u8; 64];
    faster_hex::hex_decode(body.signature.as_bytes(), &mut signature_bytes).unwrap();

    let pk = PublicKey::try_new(&body.public_key).unwrap();

    let result = verify_message(&pm, &signature_bytes.to_vec(), &pk.xonly_public_key);

    println!("{:?}", result);

    let network_type = match env::var("KASPA_NETWORK") {
        Err(_) => NetworkType::Mainnet,
        Ok(value) => match value.as_str() {
            "tn-10" => NetworkType::Testnet,
            "tn-11" => NetworkType::Testnet,
            "mainnet" => NetworkType::Mainnet,
            _ => NetworkType::Mainnet,
        },
    };

    let kaspa_address = pk.to_address(network_type).unwrap();

    let response_body = VerifyMessageOutputBody {
        address: kaspa_address.address_to_string(),
        public_key: body.public_key,
    };

    let response: Either<web::Json<VerifyMessageOutputBody>, HttpResponse> = match result {
        Ok(()) => Either::Left(web::Json(response_body)),
        Err(_e) => Either::Right(HttpResponse::UnprocessableEntity().finish()),
    };

    return response;
}

#[derive(Serialize, Deserialize, Debug)]
struct VerifyTransactionOutputBody {
    address: String,
}

#[post("/transaction/verify")]
async fn verify_transaction_service(
    req_body: String,
) -> Either<actix_web::web::Json<VerifyTransactionOutputBody>, HttpResponse> {
    let transaction_result = Transaction::deserialize_from_json(&req_body);

    let tx: Transaction = match transaction_result {
        Ok(body) => body,
        Err(error) => return Either::Right(HttpResponse::BadRequest().body(error.to_string())),
    };

    let (cctx, utxos) = match tx.tx_and_utxos() {
        Ok(tx_and_utxos) => tx_and_utxos,
        Err(error) => return Either::Right(HttpResponse::BadRequest().body(error.to_string())),
    };

    let populated_transaction = PopulatedTransaction::new(&cctx, utxos);

    let result = verify(&populated_transaction);

    let response_body = VerifyTransactionOutputBody {
        address: "TODO".to_string(),
    };

    let response: Either<web::Json<VerifyTransactionOutputBody>, HttpResponse> = match result {
        Ok(()) => Either::Left(web::Json(response_body)),
        Err(error) => Either::Right(HttpResponse::UnprocessableEntity().body(error.to_string())),
    };

    return response;
}
