import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";
import { useForm } from "react-hook-form";

type Wave = {
  address: string;
  timestamp: Date;
  message: string;
};

type BiggestWaver = {
  address: string;
  amount: number;
};

type FormSchema = {
  message: string;
};

export default function App() {
  const contractABI = abi.abi;

  const WAVE_PORTAL_CONTRACT_ADDRESS =
    process.env.REACT_APP_CONTRACT_ADDRESS || "";

  const [currentAccount, setCurrentAccount] = useState("");
  const [biggestWaver, setBiggestWaver] = useState<BiggestWaver | undefined>(
    undefined
  );
  const [allWaves, setAllWaves] = useState<Wave[]>([]);

  const form = useForm<FormSchema>();

  const getBiggestWaver = useCallback(async () => {
    try {
      const { ethereum } = window as any;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          WAVE_PORTAL_CONTRACT_ADDRESS,
          contractABI,
          signer
        );

        const waver = await wavePortalContract.getBiggestWaver();

        if (waver.waves.toNumber() !== 0) {
          setBiggestWaver({
            address: waver.wallet,
            amount: waver.waves.toNumber(),
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }, [WAVE_PORTAL_CONTRACT_ADDRESS, contractABI]);

  const getAllWaves = useCallback(async () => {
    try {
      const { ethereum } = window as any;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          WAVE_PORTAL_CONTRACT_ADDRESS,
          contractABI,
          signer
        );

        const waves = await wavePortalContract.getWaves();

        const wavesCleaned: Wave[] = [];

        waves.forEach((wave: any) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }, [WAVE_PORTAL_CONTRACT_ADDRESS, contractABI]);

  const wave = useCallback(
    async (input: FormSchema) => {
      try {
        const { ethereum } = window as any;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(
            WAVE_PORTAL_CONTRACT_ADDRESS,
            contractABI,
            signer
          );

          const count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());

          const waveTxn = await wavePortalContract.wave(input.message);
          console.log("Mining...", waveTxn.hash);

          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);

          await getAllWaves();
          await getBiggestWaver();
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
      }
    },
    [WAVE_PORTAL_CONTRACT_ADDRESS, contractABI, getAllWaves, getBiggestWaver]
  );
  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      const { ethereum } = window as any;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);

        setCurrentAccount(account);
        getAllWaves();
        getBiggestWaver();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  }, [getAllWaves, getBiggestWaver]);

  const connectWallet = useCallback(async () => {
    try {
      const { ethereum } = window as any;

      if (!ethereum) {
        window.alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [checkIfWalletIsConnected]);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio">I'm Kure (:</div>
        <div
          className="formContainer"
          style={{
            display: "flex",
            justifyContent: "center",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "16px",
          }}
        >
          <input
            placeholder="Leave a message!"
            {...form.register("message", {
              required: { value: true, message: "Please insert a message" },
            })}
          />
          {form.formState.errors.message && (
            <span>{form.formState.errors.message.message}</span>
          )}
          <button className="waveButton" onClick={form.handleSubmit(wave)}>
            Wave
          </button>
        </div>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {biggestWaver && (
          <div style={{ marginTop: "16px" }}>
            The biggest waver is:{" "}
            <span className="bold">{biggestWaver.address}</span> with{" "}
            <span className="bold">{biggestWaver.amount}</span> waves
          </div>
        )}
        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
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
      </div>
    </div>
  );
}
