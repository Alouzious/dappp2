import { useState, useEffect } from "react";
import {
  isConnected,
  getAddress,
  signTransaction,
  requestAccess
} from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

// Contract & Network config
const CONTRACT_ID = "CAGUUCTNZRAYWO2VHD3VY7LH5MGB2BXKM2QQCD3Q6HVWSPOIGK3GF35B";
const RPC_URL = "https://soroban-testnet.stellar.org";
const networkPassphrase = StellarSdk.Networks.TESTNET;

const server = new StellarSdk.rpc.Server(RPC_URL);
const contract = new StellarSdk.Contract(CONTRACT_ID);

function App() {
  // Application state
  const [walletAddress, setWalletAddress] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [freighterInstalled, setFreighterInstalled] = useState(false);

  // Check if Freighter exists
  useEffect(() => {
    async function init() {
      const installed = await isConnected();
      setFreighterInstalled(installed);
      loadMessages();
    }
    init();
  }, []);

  // Read messages from contract (read-only)
  async function loadMessages() {
    try {
      const dummy = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
      const sourceAccount = await server.getAccount(dummy);

      // Get messages
      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase
      })
        .addOperation(contract.call("get_messages"))
        .setTimeout(30)
        .build();

      const simulated = await server.simulateTransaction(tx);

      // Demo data (simplified for teaching)
      setMessages([
        { user: "GABC...XYZ", content: "Hello from Soroban!" }
      ]);
      setTotalMessages(1);

    } catch (error) {
      console.error("Read error:", error);
    }
  }

  // Connect Freighter wallet
  async function connectWallet() {
    const installed = await isConnected();
    if (!installed) {
      alert("Install Freighter wallet first");
      return;
    }

    const access = await requestAccess();
    if (!access) return;

    const result = await getAddress();
    setWalletAddress(result.address || result);
  }

  // Call add_message contract function
  async function addMessage() {
    if (!walletAddress || !message) return;

    setLoading(true);

    try {
      const account = await server.getAccount(walletAddress);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase
      })
        .addOperation(
          contract.call(
            "add_message",
            StellarSdk.nativeToScVal(walletAddress, { type: "address" }),
            StellarSdk.nativeToScVal(message, { type: "string" })
          )
        )
        .setTimeout(180)
        .build();

      const prepared = await server.prepareTransaction(tx);
      const signedXDR = await signTransaction(prepared.toXDR(), {
        networkPassphrase
      });

      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXDR,
        networkPassphrase
      );

      await server.sendTransaction(signedTx);

      setMessage("");
      loadMessages();

    } catch (error) {
      console.error("Write error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Stellar Guestbook</h2>

      {!walletAddress ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected: {walletAddress}</p>
      )}

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write message"
      />

      <button onClick={addMessage} disabled={loading}>
        Add Message
      </button>

      <h3>Messages ({totalMessages})</h3>

      {messages.map((m, i) => (
        <div key={i}>
          <b>{m.user}</b>
          <p>{m.content}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
