import React, { useEffect, useState } from "react";
import "./App.css";

const ACCOUNTS = "eth_accounts";
const REQUEST_ACCOUNTS = "eth_requestAccounts";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  const { ethereum } = window || {};

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("Ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: ACCOUNTS });

      if (!!accounts.length) {
        const [account] = accounts; // If the user have multiple accounts in their wallet we grab the first one.

        console.log("Found an authorized account:", account);

        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
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
      {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </>
  );
};

export default App;
