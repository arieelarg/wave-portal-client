import React, { useEffect } from "react";
import "./App.css";

const App = () => {
  const checkIfWalletIsConnected = () => {
    const { ethereum } = window || {};

    if (!ethereum) {
      console.log("Make sure you have metamask!");
    } else {
      console.log("Ethereum object", ethereum);
    }
  };

  useEffect(() => checkIfWalletIsConnected(), []);

  return <h1>Hello</h1>;
};

export default App;
