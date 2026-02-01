# Soroban Smart Contract Tutorial: Building a Guestbook DApp

A complete guide to building, deploying, and interacting with smart contracts on the Stellar blockchain using Soroban.

Table of Contents

Overview | Prerequisites | Part 1: Environment Setup | Part 2: Smart Contract Development | Part 3: Deployment & Interaction | Part 4: Frontend Integration | Troubleshooting | Resources

 Overview

This tutorial teaches you how to set up a complete Soroban development environment, write a smart contract in Rust, deploy contracts to Stellar testnet, and build a React frontend that interacts with your contract.

**What we're building:** A guestbook smart contract where users can add messages and retrieve them.

## 📦 Prerequisites

Before starting this tutorial, you should have basic command line knowledge, a text editor or IDE (VS Code is recommended), and Node.js with npm installed for the frontend development portion.

## Part 1: Environment Setup

### Step 1: Install Rust

Rust is the programming language used to write Soroban smart contracts.

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

This command installs the Rust programming language along with Cargo, which is Rust's package manager and build tool. Without Rust and Cargo installed, you cannot create or compile smart contracts.

After installation, restart your terminal or run:
```bash
source $HOME/.cargo/env
```

Verify installation:
```bash
rustc --version
cargo --version
```

### Step 2: Add WebAssembly (WASM) Target

Smart contracts run as WebAssembly on the blockchain.

```bash
rustup target add wasm32-unknown-unknown
```

Smart contracts must be compiled to WebAssembly (WASM) to run on the blockchain. This command adds the compiler target that converts your Rust code into WASM format. The process works like this: you write your smart contract in Rust, it gets compiled to WASM, and then that WASM code executes on the blockchain.

### Step 3: Install Soroban CLI

The Soroban CLI is your toolkit for everything blockchain-related.

```bash
cargo install --locked soroban-cli
```

The Soroban CLI is your complete toolkit for blockchain development. It allows you to build and compile contracts, deploy them to the blockchain, invoke contract functions, read blockchain data, and manage cryptographic keys. Essentially, it acts as the bridge between your computer and the blockchain, making all interactions possible.

Verify installation:
```bash
stellar --version
```

### 📝 Setup Summary

At this point, you have successfully installed Rust which allows you to write smart contracts, added the WASM target which compiles your code to blockchain-compatible format, and installed the Soroban CLI which lets you deploy and interact with contracts on the blockchain.

## Part 2: Smart Contract Development

### Step 1: Create a New Contract Project

```bash
soroban contract init my-first-contract
cd my-first-contract
```

This creates a new Soroban contract project with the standard structure. The project includes a Cargo.toml file for project configuration, a src directory containing lib.rs where your smart contract code lives, and a target directory that will hold compiled output after building.

### Step 2: Write Your Smart Contract

Open `src/lib.rs` and write your guestbook contract code. The contract should include a function to add messages, a function to retrieve all messages, and a function to get the total message count.

### Step 3: Run Tests

```bash
cargo test
```

This runs any tests you've written to ensure your contract logic works correctly.

### Step 4: Build the Contract

```bash
soroban contract build
```

This command compiles your Rust code to WebAssembly and creates a .wasm file in the target/wasm32v1-none/release/ directory. This .wasm file is the compiled contract that gets deployed to the blockchain.

## Part 3: Deployment & Interaction

### Step 1: Set Up Your Identity

First, create an account identity (we'll call it "alice"):

```bash
stellar keys generate alice --network testnet
```

### Step 2: Fund Your Account

Get testnet tokens from the Stellar friendbot:

```bash
stellar keys fund alice --network testnet
```

### Step 3: Check Your Account Address

```bash
stellar keys address alice
```

**Example output:**
```
GCW524IEJFJBQMVYOUPMTC632E4JE6MQ6BBGW5BI6UVBC3MBIVSOVPGS
```

This is your public address on the Stellar testnet.

### Step 4: Deploy the Contract

```powershell
stellar contract deploy `
  --wasm target/wasm32v1-none/release/hello_world.wasm `
  --source-account alice `
  --network testnet `
  --alias hello_world
```

**Example output:**
```
CAGUUCTNZRAYWO2VHD3VY7LH5MGB2BXKM2QQCD3Q6HVWSPOIGK3GF35B
```

This is your contract ID, and you should save it because you'll use it for all future interactions with your contract. What just happened is that your WASM file was uploaded to the Stellar testnet, the blockchain assigned it a unique contract ID, and now the contract is live and callable by anyone on the network.

### Step 5: Explore Contract Functions

Check what parameters a function accepts:

```powershell
stellar contract invoke `
  --id CAGUUCTNZRAYWO2VHD3VY7LH5MGB2BXKM2QQCD3Q6HVWSPOIGK3GF35B `
  --source-account alice `
  --network testnet `
  -- add_message --help
```

### Step 6: Add a Message to the Guestbook

```powershell
stellar contract invoke `
  --id CAGUUCTNZRAYWO2VHD3VY7LH5MGB2BXKM2QQCD3Q6HVWSPOIGK3GF35B `
  --source-account alice `
  --network testnet `
  -- add_message `
  --message '"First entry in my guestbook!"' `
  --user alice
```

This command calls the add_message function on your deployed contract, stores the message on the blockchain, and associates it with the user alice.

### Step 7: Retrieve All Messages

```powershell
stellar contract invoke `
  --id CAGUUCTNZRAYWO2VHD3VY7LH5MGB2BXKM2QQCD3Q6HVWSPOIGK3GF35B `
  --source-account alice `
  --network testnet `
  -- get_messages
```

**Example output:**
```json
[
  {
    "content": "First entry in my guestbook!",
    "user": "GCW524IEJFJBQMVYOUPMTC632E4JE6MQ6BBGW5BI6UVBC3MBIVSOVPGS"
  }
]
```

### Step 8: Get Total Message Count

```powershell
stellar contract invoke `
  --id CAGUUCTNZRAYWO2VHD3VY7LH5MGB2BXKM2QQCD3Q6HVWSPOIGK3GF35B `
  --source-account alice `
  --network testnet `
  -- get_total_messages
```

### Step 9: Generate TypeScript Bindings

Generate TypeScript code to interact with your contract from a frontend:

```powershell
stellar contract bindings typescript `
  --contract-id CAGUUCTNZRAYWO2VHD3VY7LH5MGB2BXKM2QQCD3Q6HVWSPOIGK3GF35B `
  --network testnet `
  --output-dir ./bindings
```

**Example output:**
```
⚠️  A new release of Stellar CLI is available: 23.1.2 -> 25.1.0
ℹ️  Network: Test SDF Network ; September 2015
🌎 Downloading contract spec: CAGUUCTNZRAYWO2VHD3VY7LH5MGB2BXKM2QQCD3Q6HVWSPOIGK3GF35B
ℹ️  Embedding contract address: CAGUUCTNZRAYWO2VHD3VY7LH5MGB2BXKM2QQCD3Q6HVWSPOIGK3GF35B
✅ Generated!
ℹ️  Run "npm install && npm run build" in "./bindings" to build the JavaScript NPM package.
```

This command creates TypeScript type definitions for your contract along with client code to call your contract functions from JavaScript or TypeScript, which makes frontend integration much easier and type-safe.

## Part 4: Frontend Integration

### Step 1: Create a React App

```bash
npm create vite@latest frontend
```

When prompted, select React as the framework, choose JavaScript as the variant, and press Enter to confirm your choices.

Navigate to the project:
```bash
cd frontend
```

### Step 2: Install Dependencies

Install the required packages:

```bash
npm install
npm install @stellar/stellar-sdk @stellar/freighter-api
```

The @stellar/stellar-sdk package provides Stellar's JavaScript SDK for blockchain interactions, while @stellar/freighter-api enables integration with the Freighter wallet browser extension.

### Step 3: Copy Contract Bindings

Copy the `bindings` folder generated earlier into your frontend project:

```bash
# From your contract project root
cp -r bindings ../frontend/src/
```

Your frontend structure should now include the bindings folder inside the src directory alongside App.jsx and main.jsx files.

### Step 4: Build the Bindings Package

```bash
cd src/bindings
npm install
npm run build
cd ../..
```

### Step 5: Run Your Frontend

```bash
npm run dev
```

Open your browser to the URL shown (usually `http://localhost:5173`)

### Step 6: Connect to Freighter Wallet

Install the [Freighter browser extension](https://www.freighter.app/) and create or import a wallet.

In your React app, you can now connect to the user's Freighter wallet, call your smart contract functions, and display blockchain data in your UI.
## 🔧 Troubleshooting

### Common Issues

**Issue: rustc command not found**

If you see this error, restart your terminal or run `source $HOME/.cargo/env` to load the Rust environment variables.

**Issue: wasm32-unknown-unknown target not found**

Run `rustup target add wasm32-unknown-unknown` to add the WebAssembly compilation target.

**Issue: Contract deployment fails**

Ensure your account has testnet funds by running `stellar keys fund alice --network testnet` to get free testnet tokens.

**Issue: Bindings generation fails**

Double-check your contract ID for typos and ensure you're connected to the correct network (testnet).

**Issue: Frontend can't find bindings**

Make sure you copied the bindings folder to the src directory and ran `npm install && npm run build` inside the bindings folder to compile the package.

## Resources

For more detailed information, you can explore the Soroban Documentation at https://soroban.stellar.org/docs, the Stellar Documentation at https://developers.stellar.org/, learn more about Rust at https://www.rust-lang.org/learn, download Freighter Wallet from https://www.freighter.app/, and experiment with the Stellar Laboratory at https://laboratory.stellar.org/.

## What You Learned

By completing this tutorial, you've learned to set up a complete Soroban development environment, write smart contracts in Rust, compile Rust to WebAssembly, deploy contracts to Stellar testnet, interact with contracts via CLI, generate TypeScript bindings, build a React frontend that connects to your contract, and integrate with Freighter wallet.

##  Next Steps

You can now modify the guestbook contract to add new features, deploy to Stellar mainnet (use with caution and real funds!), build more complex smart contracts, explore advanced Soroban features like custom types and cross-contract calls, and create a full-stack DApp with improved styling and user experience.

---

**Happy Building**

If you found this helpful, please star this repository and share it with others learning Soroban development.
