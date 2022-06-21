/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import React from "react";
import { ethers } from "ethers";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

import { Container, Form, Spinner } from "react-bootstrap";
import abi from "./utils/WavePortal.json";

const ACCOUNTS = "eth_accounts";
const REQUEST_ACCOUNTS = "eth_requestAccounts";
const { CONTRACT_ADDRESS } = process.env;

function FormInput({ onInput, message, wave }) {
  return (
    <Form className="pt-4 pb-4">
      <Form.Group className="mb-3" controlId="message">
        <Form.Label hidden>Write your message here!</Form.Label>
        <Form.Control
          type="text"
          placeholder="Write your message here!"
          onChange={onInput}
          value={message}
        />
      </Form.Group>
      <div className="d-grid">
        <Button variant="primary" type="button" onClick={wave}>
          Wave at Me 😎
        </Button>
      </div>
    </Form>
  );
}

function Loading() {
  return (
    <div className="d-grid pb-4 pt-4">
      <Button variant="primary" disabled>
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
        />
        <span className="visually-hidden">Loading...</span>
      </Button>
    </div>
  );
}

function App() {
  const { ethereum } = window || {};
  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = React.useState("");
  const [allWaves, setAllWaves] = React.useState([]);
  const [message, setMessage] = React.useState();
  const [loading, setLoading] = React.useState(false);

  // eslint-disable-next-line no-shadow
  const onInput = ({ target: { value } }) => setMessage(value);

  const getAllWaves = async () => {
    try {
      if (!ethereum) return;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      const waves = await wavePortalContract.getAllWaves();

      const wavesCleaned = waves.map((waveData) => {
        return {
          address: waveData.waver,
          timestamp: new Date(waveData.timestamp * 1000),
          message: waveData.message,
        };
      });

      setAllWaves(wavesCleaned);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, waveMessage) => {
      // console.log("NewWave", from, timestamp, waveMessage);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: waveMessage,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

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
      setLoading(true);

      const provider = new ethers.providers.Web3Provider(ethereum);

      const signer = provider.getSigner();

      const wavePortalContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      let count = await wavePortalContract.getTotalWaves();
      console.log("Initial total wave count...", count.toNumber());

      const waveTxn = await wavePortalContract.wave(message, {
        gasLimit: 300000,
      });
      console.log("Mining...", waveTxn.hash);

      await waveTxn.wait();
      console.log("Mined -- ", waveTxn.hash);

      setLoading(false);

      count = await wavePortalContract.getTotalWaves();
      console.log("Modified total wave count...", count.toNumber());
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  React.useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <Container>
      <Card className="text-center">
        <Card.Body>
          <Card.Title>
            <h1>Hello!</h1>
          </Card.Title>
          <Card.Text>{currentAccount || "Mr. X"}</Card.Text>
        </Card.Body>
      </Card>
      {!currentAccount ? (
        <div className="d-grid pt-4 pb-4">
          <Button className="button" onClick={connectWallet} type="button">
            Please, connect your Wallet
          </Button>
        </div>
      ) : loading ? (
        <Loading />
      ) : (
        <FormInput onInput={onInput} message={message} wave={wave} />
      )}

      {allWaves.map((waveData) => {
        return (
          <Card key={waveData.timestamp.toString()} className="p-2 mt-2">
            <div>Address: {waveData.address}</div>
            <div>Time: {waveData.timestamp.toString()}</div>
            <div>Message: {waveData.message}</div>
          </Card>
        );
      })}
    </Container>
  );
}

export default App;
