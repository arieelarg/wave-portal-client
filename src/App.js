import React from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

const ACCOUNTS = "eth_accounts";
const REQUEST_ACCOUNTS = "eth_requestAccounts";

const App = () => {
  const { ethereum } = window || {};
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = React.useState("");
  const [allWaves, setAllWaves] = React.useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return;

      const accounts = await ethereum.request({ method: ACCOUNTS });

      if (!accounts.length) return;

      const [account] = accounts; // If the user have multiple accounts in their wallet we grab the first one.

      setCurrentAccount(account);

      getAllWaves();
    } catch (err) {
      console.log(err);
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: REQUEST_ACCOUNTS,
      });

      console.log("Connected", [accounts]);
      setCurrentAccount([accounts]);
    } catch (err) {
      console.log(err);
    }
  };

  const wave = async () => {
    try {
      if (!ethereum) return;

      const provider = new ethers.providers.Web3Provider(ethereum);

      const signer = provider.getSigner();

      const wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      let count = await wavePortalContract.getTotalWaves();
      console.log("Retrieved initial total wave count...", count.toNumber());

      const waveTxn = await wavePortalContract.wave("Tre men do");
      console.log("Mining...", waveTxn.hash);

      await waveTxn.wait();
      console.log("Mined -- ", waveTxn.hash);

      count = await wavePortalContract.getTotalWaves();

      console.log("Retrieved modified total wave count...", count.toNumber());
    } catch (error) {
      console.log(error);
    }
  };

  const getAllWaves = async () => {
    try {
      if (!ethereum) return;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const waves = await wavePortalContract.getAllWaves();

      let wavesCleaned = [];

      waves.forEach((wave) => {
        wavesCleaned.push({
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        });
      });

      setAllWaves(wavesCleaned);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <>
      <h1>Hello, {currentAccount}</h1>
      <br />
      {!currentAccount ? (
        <button className="button" onClick={connectWallet}>
          Connect to Wallet
        </button>
      ) : (
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
      )}
      {allWaves.map((wave, index) => {
        return (
          <div
            key={wave.address.toString()}
            style={{
              backgroundColor: "OldLace",
              marginTop: "16px",
              padding: "8px",
            }}
          >
            <div>Address: {wave.address}</div>
            <div>Time: {wave.timestamp.toString()}</div>
            <div>Message: {wave.message}</div>
          </div>
        );
      })}
    </>
  );
};

export default App;
