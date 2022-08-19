import React from "react";
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import { HomePage } from "./pages/home";

export default function App() {
  return (
    <ChakraProvider>
      <HomePage />
    </ChakraProvider>
  );
}
