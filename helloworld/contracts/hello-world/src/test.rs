#![cfg(test)]

use super::*; // brings GuestbookContract & Client from lib.rs

use soroban_sdk::{
    Env,
    Address,
    String,
    testutils::Address as _, // enables Address::generate()
};

#[test]
fn test_add_message() {
    let env = Env::default();
    let contract_id = env.register(GuestbookContract, ());
    let client = GuestbookContractClient::new(&env, &contract_id);

    env.mock_all_auths();

    let user = Address::generate(&env);
    client.add_message(&user, &String::from_str(&env, "Hello Stellar"));

    let messages = client.get_messages();
    assert_eq!(messages.len(), 1);
}
