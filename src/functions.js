import { ethers } from "ethers";
import { account1Address, ETHERSCAN_API_KEY, INFURA_ID, network } from "./env";
import { ERC20_ABI2 } from "./ERC_20_ABI";

String.prototype.hexEncode = function () {
  var hex, i;

  var result = "";
  for (i = 0; i < this.length; i++) {
    hex = this.charCodeAt(i).toString(16);
    result += ("000" + hex).slice(-4);
  }

  return result;
};

export async function ConnectingtoEthereumMetaMask() {
  // A Web3Provider wraps a standard Web3 provider, which is
  // what MetaMask injects as window.ethereum into each page
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // MetaMask requires requesting permission to connect users accounts
  await provider.send("eth_requestAccounts", []);

  // The MetaMask plugin also allows signing transactions to
  // send ether and pay to change state within the blockchain.
  // For this, you need the account signer...
  const signer = provider.getSigner();
  console.log(signer, provider);
  return { signer, provider };
}

export function getInfuraProvider() {
  const provider = new ethers.providers.JsonRpcProvider(
    `https://mainnet.infura.io/v3/${INFURA_ID}`
  );
  console.log({ provider });
  return provider;
}

export const contractEventStream = async () => {
  //   const { signer, provider } = await ConnectingtoEthereumMetaMask();
  const provider = getInfuraProvider();
  const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint)",

    "event Transfer(address indexed from, address indexed to, uint amount)",
  ];

  const address = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI Contract
  const contract = new ethers.Contract(address, ERC20_ABI, provider);

  const block = await provider.getBlockNumber();

  const transferEvents = await contract.queryFilter(
    "Transfer",
    block - 1,
    block
  );
  console.log(transferEvents);
  return transferEvents;
};

// contractEventStream();

// import { ethers } from "ethers";
// import * as logger from "winston";
// import { MNEMONIC } from "../env.js";

/* COMMONS */
export function getWalletFromMnemonic(mnemonic) {
  const walletFromMnemonic = ethers.Wallet.fromMnemonic(mnemonic);
  return walletFromMnemonic;
}

export function getWalletFromKey(privateKey, provider) {
  return new ethers.Wallet(privateKey, provider);
}

export async function ConnectingtoEthereumRPC(url) {
  // If you don't specify a //url//, Ethers connects to the default
  // (i.e. ``http:/\/localhost:8545``)
  const provider = new ethers.providers.JsonRpcProvider(url);

  // The provider also allows signing transactions to
  // send ether and pay to change state within the blockchain.
  // For this, we need the account signer...
  const signer = provider.getSigner();
  console.log(signer, provider);
}

export async function QueryingtheBlockchain(
  provider = getInfuraProvider(),
  accountAddress = account1Address
) {
  console.log("called: QueryingtheBlockchain");
  try {
    // Look up the current block number
    const block = await provider.getBlockNumber();
    // 14467379
    console.log({ block });

    // Get the balance of an account (by address or ENS name, if supported by network)
    const balance = await provider.getBalance(accountAddress);
    const gasPrice = await provider.getGasPrice();
    const transactionCount = await provider.getTransactionCount(accountAddress);
    // { BigNumber: "82826475815887608" }

    // Often you need to format the output to something more user-friendly,
    // such as in ether (instead of wei)
    const formatted = ethers.utils.formatEther(balance);
    // '0.082826475815887608'

    // If a user enters a string in an input field, you may need
    // to convert it from ether (as a string) to wei (as a BigNumber)
    const parsed = ethers.utils.parseEther("1.0");
    // { BigNumber: "1000000000000000000" }
    const result = {
      block,
      balance,
      parsed,
      formatted,
      gasPrice,
      transactionCount,
    };
    console.log({
      block,
      balance,
      parsed,
      formatted,
      gasPrice,
      transactionCount,
    });
    return result;
  } catch (error) {
    console.error(error);
  }
}

export function sendEth(signer, to = "ricmoo.firefly.eth", value = "0.0") {
  // Send 1 ether to an ens name.
  const tx = signer.sendTransaction({
    to: to,
    value: ethers.utils.parseEther(value),
  });
  return tx;
}

export function ConnectingtotheDAIContract(
  provider,
  daiAddress = "dai.tokens.ethers.eth"
) {
  // You can also use an ENS name for the contract address
  // const daiAddress = "dai.tokens.ethers.eth";

  // The ERC-20 Contract ABI, which is a common contract interface
  // for tokens (this is the Human-Readable ABI format)
  //   const daiAbi = [
  //     // Some details about the token
  //     " name() view returns (string)",
  //     ,
  //     " symbol() view returns (string)",

  //     ,
  //     // Get the account balance
  //     " balanceOf(address) view returns (uint)",

  //     ,
  //     // Send some of your tokens to someone else
  //     " transfer(address to, uint amount)",

  //     // An event triggered whenever anyone transfers to someone else
  //     "event Transfer(address indexed from, address indexed to, uint amount)",
  //   ];

  const daiAbi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint)",
  ];

  // The Contract object
  const daiContract = new ethers.Contract(daiAddress, daiAbi, provider);
  console.log(daiContract);
  return daiContract;
}

export async function QueryingtheDAIContract(daiContract) {
  // Get the ERC-20 token name
  console.log(await daiContract.name());
  // 'Dai Stablecoin'

  // Get the ERC-20 token symbol (for tickers and UIs)
  console.log(await daiContract.symbol());
  // 'DAI'

  // Get the balance of an address
  const balance = await daiContract.balanceOf("ricmoo.firefly.eth");
  console.log(balance);
  // { BigNumber: "8501797437309328201631" }

  // Format the DAI for displaying to the user
  const formatUnits = ethers.utils.formatUnits(balance, 18);
  console.log(formatUnits);
  // '8501.797437309328201631'
}

export async function SendingDAI({
  contract,
  signer,
  to = "ricmoo.firefly.eth",
  units = "1.0",
}) {
  // The DAI Contract is currently connected to the Provider,
  // which is read-only. You need to connect to a Signer, so
  // that you can pay to send state-changing transactions.
  const daiWithSigner = contract.connect(signer);

  // Each DAI has 18 decimal places
  const dai = ethers.utils.parseUnits(units, 18);

  // Send 1 DAI to "ricmoo.firefly.eth"
  const tx = daiWithSigner.transfer(to, dai);
  return tx;
}

//
//   ConnectingtoEthereumRPC();

export async function walletBalance(privateKey) {
  const { signer, provider } = await ConnectingtoEthereumMetaMask();
  // provider = new ethers.providers.Web3Provider(window.ethereum);

  const w = getWalletFromKey(privateKey, provider);

  let balancePromise = w.getBalance();
  const balance = await balancePromise;
  const formatted = ethers.utils.formatEther(balance);
  console.log({ formatted });
  return formatted;
}

export async function accountHistory(account1Address) {
  const { signer, provider } = await ConnectingtoEthereumMetaMask();
  provider.resetEventsBlock(0);
  provider.on(account1Address, (balance) => {
    console.log("New Balance: " + ethers.utils.formatEther(balance));
  });
}

export function getEtherScanProvider() {
  return new ethers.providers.EtherscanProvider(network, ETHERSCAN_API_KEY);
}
export async function accountHistoryEthScan(account1Address) {
  const provider = getEtherScanProvider();
  // const address = "0x99b02491Fd1A9a7A97a31d046767c08D5cCc9A1d";
  const history = await provider.getHistory(account1Address);
  console.log(history);
  return history;
}

export async function walletSendFull(
  privateKey,
  toAddress,
  amt = "1.0",
  gasPrice = "20000000000"
) {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const { signer, provider } = await ConnectingtoEthereumMetaMask();

    console.log(wallet.address);
    // "0x7357589f8e367c2C31F51242fB77B350A11830F3"
    const { chainId } = await provider.getNetwork();

    // All properties are optional
    const transaction = {
      nonce: Date.now(),
      gasLimit: 21000,
      gasPrice: ethers.BigNumber.from(gasPrice),
      to: toAddress,
      // ... or supports ENS names
      // to: "ricmoo.firefly.eth",

      value: ethers.utils.parseEther(amt),
      data: "Mahi".hexEncode(),
      // This ensures the transaction cannot be replayed on different networks
      chainId: chainId,
    };

    const signedTransaction = await wallet.signTransaction(transaction);

    console.log(signedTransaction);
    // "0xf86c808504a817c8008252089488a5c2d9919e46f883eb62f7b8dd9d0cc45bc2
    //    90880de0b6b3a76400008025a05e766fa4bbb395108dc250ec66c2f88355d240
    //    acdc47ab5dfaad46bcf63f2a34a05b2cb6290fd8ff801d07f6767df63c1c3da7
    //    a7b83b53cd6cea3d3075ef9597d5"

    // This can now be sent to the Ethereum network
    // let provider = ethers.getDefaultProvider();
    const tx = await provider.sendTransaction(signedTransaction);

    console.log(tx);
    tx.wait();
    console.log(tx);
    // {
    //    // These will match the above values (excluded properties are zero)
    //    "nonce", "gasLimit", "gasPrice", "to", "value", "data", "chainId"
    //
    //    // These will now be present
    //    "from", "hash", "r", "s", "v"
    //  }
    // Hash:
  } catch (error) {
    console.error(error);
  }
}

export async function walletSendTx2(
  account1PK,
  account2Address,
  amt = "0.025"
) {
  const { signer, provider } = await ConnectingtoEthereumMetaMask();
  const wallet = new ethers.Wallet(account1PK, provider);

  const senderBalanceBefore = await wallet.getBalance();
  console.log(senderBalanceBefore);
  const recieverBalanceBefore = await provider.getBalance(account2Address);

  console.log(
    `\nSender balance before: ${ethers.utils.formatEther(senderBalanceBefore)}`
  );
  console.log(
    `reciever balance before: ${ethers.utils.formatEther(
      recieverBalanceBefore
    )}\n`
  );

  const tx = await wallet.sendTransaction({
    to: account2Address,
    value: ethers.utils.parseEther(amt),
  });
  console.log("before", tx);
  await tx.wait();
  console.log("after", tx);
  const senderBalanceAfter = await wallet.getBalance();
  const recieverBalanceAfter = await provider.getBalance(account2Address);
  console.log(
    `\nSender balance after: ${ethers.utils.formatEther(senderBalanceAfter)}`
  );
  console.log(
    `reciever balance after: ${ethers.utils.formatEther(
      recieverBalanceAfter
    )}\n`
  );
}

export const inspectBlock = async () => {
  const { signer, provider } = await ConnectingtoEthereumMetaMask();

  const block = await provider.getBlockNumber();

  console.log(`\nBlock Number: ${block}\n`);

  const blockInfo = await provider.getBlock(block);

  console.log(blockInfo);
  const { transactions } = await provider.getBlockWithTransactions(block);

  console.log(`\nLogging first transaction in block:\n`);
  console.log(transactions[0]);
  return {
    block,
    blockInfo,
    transactions,
  };
};

// inspectBlock(provider)

export const readSmartContract = async () => {
  const { signer, provider } = await ConnectingtoEthereumMetaMask();

  //   const ERC20_ABI = [
  //     "function name() view returns (string)",
  //     "function symbol() view returns (string)",
  //     "function totalSupply() view returns (uint256)",
  //     "function balanceOf(address) view returns (uint)",
  //   ];
  const ERC20_ABI = ERC20_ABI2;

  const address = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI Contract
  const contract = new ethers.Contract(address, ERC20_ABI, provider);
  console.log(contract);
  const name = await contract.name();
  const symbol = await contract.symbol();
  const totalSupply = await contract.totalSupply();

  console.log(`\nReading from ${address}\n`);
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Total Supply: ${totalSupply}\n`);

  const balance = await contract.balanceOf(
    "0x6c6Bc977E13Df9b0de53b251522280BB72383700"
  );
  console.log(`Balance Returned: ${balance}`);
  console.log(`Balance Formatted: ${ethers.utils.formatEther(balance)}\n`);
};
export async function readSmartContract2() {
  // const { signer, provider } = await ConnectingtoEthereumMetaMask();
  const provider = getInfuraProvider();

  // You can also use an ENS name for the contract address
  const daiAddress = "dai.tokens.ethers.eth";

  // The ERC-20 Contract ABI, which is a common contract interface
  // for tokens (this is the Human-Readable ABI format)
  const daiAbi = [
    // Some details about the token
    "function name() view returns (string)",
    "function symbol() view returns (string)",

    // Get the account balance
    "function balanceOf(address) view returns (uint)",

    // Send some of your tokens to someone else
    "function transfer(address to, uint amount)",

    // An event triggered whenever anyone transfers to someone else
    "event Transfer(address indexed from, address indexed to, uint amount)",
  ];

  // The Contract object
  const daiContract = new ethers.Contract(
    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    daiAbi,
    provider
  );

  // Get the ERC-20 token name
  const name = await daiContract.name();
  // 'Dai Stablecoin'

  // Get the ERC-20 token symbol (for tickers and UIs)
  const symbol = await daiContract.symbol();
  // 'DAI'

  // Get the balance of an address
  const balance = await daiContract.balanceOf("ricmoo.firefly.eth");
  // { BigNumber: "8501797437309328201631" }

  // Format the DAI for displaying to the user
  const formatted = ethers.utils.formatUnits(balance, 18);
  // '8501.797437309328201631'
  console.log({ name, symbol, balance, formatted });
  return {
    name,
    symbol,
    // balance,
    formatted,
  };
}

// const provider = new ethers.providers.JsonRpcProvider(
//   `https://kovan.infura.io/v3/${INFURA_ID}`
// );

// const account1Address = ""; // Your account address 1
// const account2Address = ""; // Your account address 2

// const account1PK = ""; // Private key of account 1
// const wallet = new ethers.Wallet(account1PK, provider)

export async function sendSignedTransaction(account1PK, account2Address) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const wallet = new ethers.Wallet(account1PK, provider);
    const senderBalanceBefore = await wallet.getBalance();
    console.log(senderBalanceBefore);
    const recieverBalanceBefore = await provider.getBalance(account2Address);

    console.log(
      `\nSender balance before: ${ethers.utils.formatEther(
        senderBalanceBefore
      )}`
    );
    console.log(
      `reciever balance before: ${ethers.utils.formatEther(
        recieverBalanceBefore
      )}\n`
    );

    const tx = await wallet.sendTransaction({
      to: account2Address,
      nonce: Date.now(),
      value: ethers.utils.parseEther("0.025"),
    });

    console.log("tx", tx);

    await tx.wait();
    console.log(tx);

    const senderBalanceAfter = await wallet.getBalance();
    const recieverBalanceAfter = await provider.getBalance(account2Address);

    console.log(
      `\nSender balance after: ${ethers.utils.formatEther(senderBalanceAfter)}`
    );
    console.log(
      `reciever balance after: ${ethers.utils.formatEther(
        recieverBalanceAfter
      )}\n`
    );
    return {
      senderBalanceBefore,
      recieverBalanceBefore,
      senderBalanceAfter,
      recieverBalanceAfter,
      tx,
    };
  } catch (error) {
    console.error(error);
  }
}

export async function sendSignedTransaction2(privateKey, receiverAddress) {
  // import ethers.js
  //   const ethers = require("ethers");
  // network: using the Rinkeby testnet
  let network = "ropsten";
  // provider: Infura or Etherscan will be automatically chosen
  //   let provider = ethers.getDefaultProvider(network);
  // Sender private key:
  // correspondence address 0xb985d345c4bb8121cE2d18583b2a28e98D56d04b

  // Create a wallet instance
  const { signer, provider } = await ConnectingtoEthereumMetaMask();

  let wallet = new ethers.Wallet(privateKey, provider);
  console.log(await wallet.getBalance());
  // Receiver Address which receives Ether
  // Ether amount to send
  let amountInEther = "0.0000001";
  // Create a transaction object
  let tx = {
    nonce: Date.now(),
    to: receiverAddress,
    // Convert currency unit from ether to wei
    value: ethers.utils.parseEther(amountInEther),
  };
  // Send a transaction
  wallet.sendTransaction(tx).then((txObj) => {
    console.log("txHash", txObj.hash);
    // => 0x9c172314a693b94853b49dc057cf1cb8e529f29ce0272f451eea8f5741aa9b58
    // A transaction result can be checked in a etherscan with a transaction hash which can be obtained here.
  });
}

// sendSignedTransaction2(account1PK, account2Address)

export async function disconnectMetamask(privateKey, receiverAddress) {
  const { signer, provider } = await ConnectingtoEthereumMetaMask();
}

export async function sweep(privateKey, newAddress) {
  const { signer, provider } = await ConnectingtoEthereumMetaMask();
  const wallet = new ethers.Wallet(privateKey, provider);

  // Make sure we are sweeping to an EOA, not a contract. The gas required
  // to send to a contract cannot be certain, so we may leave dust behind
  // or not set a high enough gas limit, in which case the transaction will
  // fail.
  let code = await provider.getCode(newAddress);
  if (code !== "0x") {
    throw new Error("Cannot sweep to a contract");
  }

  // Get the current balance
  let balance = await wallet.getBalance();

  // Normally we would let the Wallet populate this for us, but we
  // need to compute EXACTLY how much value to send
  let gasPrice = await provider.getGasPrice();

  // The exact cost (in gas) to send to an Externally Owned Account (EOA)
  let gasLimit = 21000;

  // The balance less exactly the txfee in wei
  let value = balance.sub(gasPrice.mul(gasLimit));

  let tx = await wallet.sendTransaction({
    gasLimit: gasLimit,
    gasPrice: gasPrice,
    to: newAddress,
    value: value,
  });

  console.log("Sent in Transaction: " + tx.hash);
  return tx;
}
