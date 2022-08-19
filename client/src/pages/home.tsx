import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { FC, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import abi from "../utils/WavePortal.json";
import { ethers } from "ethers";

type FormSchema = {
  message: string;
};

type Wave = {
  address: string;
  timestamp: Date;
  message: string;
};

type BiggestWaver = {
  address: string;
  amount: number;
};

export const HomePage: FC = () => {
  const contractABI = abi.abi;

  const WAVE_PORTAL_CONTRACT_ADDRESS =
    process.env.REACT_APP_CONTRACT_ADDRESS || "";

  const [allWaves, setAllWaves] = useState<Wave[]>([]);
  const [biggestWaver, setBiggestWaver] = useState<BiggestWaver | undefined>(
    undefined
  );
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<FormSchema>();

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
      }
    } catch (error) {
      console.log("ERROR:", error);
    }
  }, [WAVE_PORTAL_CONTRACT_ADDRESS, contractABI]);

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
      console.log("ERROR:", e);
    }
  }, [WAVE_PORTAL_CONTRACT_ADDRESS, contractABI]);

  const wave = useCallback(
    async (input: FormSchema) => {
      setLoading(true);

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

          const waveTxn = await wavePortalContract.wave(input.message);

          await waveTxn.wait();

          await getAllWaves();
          await getBiggestWaver();
        }
      } catch (error) {
        console.log("ERROR:", error);
      }

      setLoading(false);
    },
    [WAVE_PORTAL_CONTRACT_ADDRESS, contractABI, getAllWaves, getBiggestWaver]
  );
  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      const { ethereum } = window as any;

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];

        setCurrentAccount(account);
        getAllWaves();
        getBiggestWaver();
      }
    } catch (error) {
      console.log("ERROR:", error);
    }
  }, [getAllWaves, getBiggestWaver]);

  const connectWallet = useCallback(async () => {
    setLoading(true);

    try {
      const { ethereum } = window as any;

      if (!ethereum) {
        window.alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log("ERROR:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [checkIfWalletIsConnected]);

  return (
    <Box w="full" h="100vh" bg="green.500" p={12}>
      {!currentAccount && (
        <Flex w="full" justifyContent="flex-end">
          <Button
            onClick={connectWallet}
            ml="auto"
            colorScheme="orange"
            isLoading={loading}
            disabled={loading}
          >
            Connect Wallet
          </Button>
        </Flex>
      )}
      <VStack justifyContent="center">
        <Text fontWeight="bold">👋 Hey there!</Text>
        <Text fontWeight="medium">Im Kure (:</Text>
      </VStack>
      <VStack justifyContent="center" p={4}>
        <HStack>
          <Input {...form.register("message")} />
          <Button
            onClick={form.handleSubmit(wave)}
            isLoading={loading}
            disabled={loading}
          >
            Wave
          </Button>
        </HStack>
        <Text fontWeight="extrabold">The highest waver gets a K42 token</Text>
      </VStack>
      <VStack ml="25%" w="50%" justifyContent="center">
        {biggestWaver && (
          <Box bg="gold" m={4} p={4} rounded="md" w="full">
            <Text>The biggest waver is:</Text>
            <Text as="span" fontWeight="bold">
              {biggestWaver.address}
            </Text>
            <Text as="span"> with </Text>
            <Text as="span" fontWeight="bold">
              {`${biggestWaver.amount} `}
            </Text>
            waves
          </Box>
        )}
        {allWaves.map((wave) => (
          <VStack
            w="full"
            key={wave.timestamp.getTime()}
            alignItems="flex-start"
            border="1px solid black"
            rounded="md"
            p={4}
            bg="blue.400"
            wordBreak="break-all"
          >
            <HStack>
              <Text fontWeight="medium">Address: </Text>
              <Text as="span" fontWeight="bold">
                {wave.address}
              </Text>
            </HStack>
            <Text fontWeight="medium">
              Time: {wave.timestamp.toLocaleString()}
            </Text>
            <Text fontWeight="medium">Message: {wave.message}</Text>
          </VStack>
        ))}
      </VStack>
    </Box>
  );
};
