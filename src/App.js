import { useState, memo } from "react";
import "./App.css";
import {
  account1Address,
  account1PK,
  account2Address,
  daiAddress,
} from "./env";
import {
  accountHistoryEthScan,
  ConnectingtoEthereumMetaMask,
  ConnectingtotheDAIContract,
  contractEventStream,
  getInfuraProvider,
  inspectBlock,
  QueryingtheBlockchain,
  readSmartContract,
  readSmartContract2,
  sendSignedTransaction,
  sendSignedTransaction2,
  sweep,
  walletBalance,
  walletSendTx2,
} from "./functions";

function App() {
  const [data, setData] = useState("");

  // const data = [];
  return (
    <div className="App">
      <header className="App-header">
        <button
          onClick={() => {
            console.log("Has Metamask", window.ethereum.isMetaMask);
            setData(`"Has Metamask", ${window.ethereum.isMetaMask}`);
          }}
        >
          Has Metamask
        </button>
        <button
          onClick={() => {
            var isMetamaskConnected = window.ethereum.isConnected();
            console.log("isMetamaskConnected", isMetamaskConnected);
            setData(`"isMetamaskConnected", ${isMetamaskConnected}`);
          }}
        >
          Metamask Connected
        </button>

        <button onClick={ConnectingtoEthereumMetaMask}>Connect Metamask</button>
        <button
          onClick={async () => {
            const data = await walletBalance(account1PK);
            setData(data);
          }}
        >
          Wallet Balance
        </button>
        <button
          onClick={async () => {
            const res = await QueryingtheBlockchain(
              getInfuraProvider(),
              account1Address
            );
            setData(res);
          }}
        >
          Querying The Blockchain
        </button>
        <button
          onClick={async () => {
            const data = await inspectBlock();
            console.log(JSON.stringify(data, null, 2));
            setData(data);
          }}
        >
          inspectBlock
        </button>
        <button
          onClick={() => {
            walletSendTx2(account1PK, account2Address);
          }}
        >
          Wallet Send Tx
        </button>
        {/* <button
          onClick={() => {
            sendSignedTransaction2(account1PK, account2Address);
          }}
        >
          Send Signed Transaction
        </button> */}
        <button
          onClick={async () => {
            const txdata = await sendSignedTransaction(
              account1PK,
              account2Address
            );
            setData(txdata);
          }}
        >
          Send Signed Transaction
        </button>
        <button
          onClick={async () => {
            const h = await accountHistoryEthScan(account1Address);
            setData(h);
          }}
        >
          accountHistoryEthScan
        </button>

        <button
          onClick={async () => {
            const tx = await sweep(account1PK, account2Address);
            setData(tx);
          }}
        >
          sweep
        </button>

        <button
          onClick={async () => {
            const { signer, provider } = await ConnectingtoEthereumMetaMask();
            const contract = await ConnectingtotheDAIContract(
              provider,
              daiAddress
            );
            console.log("DAI contract", contract);
            setData(contract.address);
          }}
        >
          Connecting To The DAI Contract
        </button>
        <button
          onClick={() => {
            readSmartContract2();
          }}
        >
          readSmartContract
        </button>
        <button
          onClick={async () => {
            const events = await contractEventStream();
            setData(events);
          }}
        >
          Contract Event Stream
        </button>

        {/* <code children={PrettyPrintJson(data)}></code> */}
      </header>
      <div className="code-parent">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App;
