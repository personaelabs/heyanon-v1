import { ethers } from "ethers";
import { changeNetworkName } from "./web3";

declare let window: any;
let signer: any, provider: any, network: any;

export async function setupWeb3() {
    console.log("Attempting to set up web3");
    provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log(provider);
    await provider.send("eth_requestAccounts", []);
    const currentNetwork = await provider.getNetwork();
    provider.on("network", (newNetwork: any, oldNetwork: any) => {
      if (oldNetwork) {
        window.location.reload();
        network = changeNetworkName(newNetwork);
      }
    });
    const signer = provider.getSigner();
    return { provider, signer, network: changeNetworkName(currentNetwork) };
  }
  