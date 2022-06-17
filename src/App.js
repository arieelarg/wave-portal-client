import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

const ACCOUNTS = "eth_accounts";
const REQUEST_ACCOUNTS = "eth_requestAccounts";

const App = () => {
  const { ethereum } = window || {};
  const contractAddress = "0x3bD605b1d3D6bDDCc06BA4c6c5204249bF1e1355";
  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return;

      const accounts = await ethereum.request({ method: ACCOUNTS });

      if (!!accounts.length) {
        const [account] = accounts; // If the user have multiple accounts in their wallet we grab the first one.

        setCurrentAccount(account);
      } else {
        // console.log("No authorized account found");
      }
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

      const waveTxn = await wavePortalContract.wave();
      console.log("Mining...", waveTxn.hash);

      await waveTxn.wait();
      console.log("Mined -- ", waveTxn.hash);

      count = await wavePortalContract.getTotalWaves();

      console.log("Retrieved modified total wave count...", count.toNumber());
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
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
    </>
  );
};

export default App;
