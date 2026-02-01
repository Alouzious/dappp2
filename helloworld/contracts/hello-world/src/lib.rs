#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env, Vec, String, symbol_short
};

#[contracttype]
#[derive(Clone)]
pub struct Message {
    pub user: Address,
    pub content: String,
}

#[contract]
pub struct GuestbookContract;

#[contractimpl]
impl GuestbookContract {

    pub fn add_message(env: Env, user: Address, message: String) {
        user.require_auth();

        let key = symbol_short!("MESSAGES");

        let mut messages: Vec<Message> =
            env.storage().instance().get(&key).unwrap_or(Vec::new(&env));

        messages.push_back(Message {
            user,
            content: message,
        });

        env.storage().instance().set(&key, &messages);
    }

    pub fn get_messages(env: Env) -> Vec<Message> {
        let key = symbol_short!("MESSAGES");
        env.storage().instance().get(&key).unwrap_or(Vec::new(&env))
    }

    pub fn get_total_messages(env: Env) -> u32 {
        Self::get_messages(env).len()
    }
}

#[cfg(test)]
mod test;
