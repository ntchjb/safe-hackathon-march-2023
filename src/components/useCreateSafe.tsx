import { useUserContext } from "@/context/user";
import { GelatoRelayAdapter, RelayTransaction } from "@safe-global/relay-kit";
import { DeploymentFilter, getCompatibilityFallbackHandlerDeployment, getMultiSendCallOnlyDeployment, getProxyFactoryDeployment, getSafeL2SingletonDeployment, getSafeSingletonDeployment } from "@safe-global/safe-deployments";
import EthersAdapter from "@safe-global/safe-ethers-lib";
import { ethers } from 'ethers';
import { GetContractProps, MetaTransactionData, OperationType } from "@safe-global/safe-core-sdk-types";
import { arrayify, solidityPack } from "ethers/lib/utils";
import { useEffect, useState } from "react";
import GnosisSafeProxyFactoryEthersContract from "@safe-global/safe-ethers-lib/dist/src/contracts/GnosisSafeProxyFactory/GnosisSafeProxyFactoryEthersContract";
import GnosisSafeContractEthers from "@safe-global/safe-ethers-lib/dist/src/contracts/GnosisSafe/GnosisSafeContractEthers";
import MultiSendCallOnlyEthersContract from "@safe-global/safe-ethers-lib/dist/src/contracts/MultiSendCallOnly/MultiSendCallOnlyEthersContract";
import CompatibilityFallbackHandlerEthersContract from "@safe-global/safe-ethers-lib/dist/src/contracts/CompatibilityFallbackHandler/CompatibilityFallbackHandlerEthersContract";

export const safeDeploymentsL1ChainIds: number[] = [
  1, // Ethereum Mainnet
  5, // Goerli testnet
]

export const SAFE_VERSION = '1.3.0'
export const GELATO_API_KEY = process.env.NEXT_PUBLIC_GELATO_API_KEY ?? '';

export const useCreateSafe = () => {
  const { provider, chainId } = useUserContext();
  const [factoryContract, setFactoryContract] = useState<GnosisSafeProxyFactoryEthersContract>();
  const [safeContract, setSafeContract] = useState<GnosisSafeContractEthers>();
  const [multiSendCallOnlyContract, setMultiSendCallOnlyContract] = useState<MultiSendCallOnlyEthersContract>();
  const [compatFallbackContract, setCompatFallbackContract] = useState<CompatibilityFallbackHandlerEthersContract>();



  const filter: DeploymentFilter = {
    version: SAFE_VERSION,
    network: chainId.toString(),
    released: true,
  };
  const safeDeployment = safeDeploymentsL1ChainIds.includes(chainId) ? getSafeSingletonDeployment(filter)! : getSafeL2SingletonDeployment(filter)!
  const compatFallbackDeployment = getCompatibilityFallbackHandlerDeployment(filter);
  const factoryProxyDeployment = getProxyFactoryDeployment(filter);
  const multisendCallOnlyDeployment = getMultiSendCallOnlyDeployment(filter);

  const gelato = new GelatoRelayAdapter(GELATO_API_KEY);

  useEffect(() => {
    if (!provider) {
      return;
    }

    const signer = provider.getSigner();
    const ethersAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer,
    });

    setFactoryContract(ethersAdapter.getSafeProxyFactoryContract({
      chainId,
      safeVersion: SAFE_VERSION,
      singletonDeployment: factoryProxyDeployment,
    }))
    setSafeContract(ethersAdapter.getSafeContract({
      chainId,
      safeVersion: SAFE_VERSION,
      singletonDeployment: safeDeployment,
    }))
    setMultiSendCallOnlyContract(ethersAdapter.getMultiSendCallOnlyContract({
      chainId,
      safeVersion: SAFE_VERSION,
      singletonDeployment: multisendCallOnlyDeployment,
    }))
    setCompatFallbackContract(ethersAdapter.getCompatibilityFallbackHandlerContract({
      chainId,
      safeVersion: SAFE_VERSION,
      singletonDeployment: compatFallbackDeployment,
    }))
  }, [provider, chainId, factoryProxyDeployment, safeDeployment, multisendCallOnlyDeployment, compatFallbackDeployment]);

  async function createSafe(owners: string[], threshold: number, sponsored = false) {
    if (!provider) {
      alert('no provider when creating safe')
      return;
    }
    const signer = provider.getSigner();
    if (!factoryContract || !safeContract || !multiSendCallOnlyContract || !compatFallbackContract) {
      alert('contract not available')
      return;
    }
    console.log('Factory address:', factoryContract.getAddress())
    console.log('Safe address:', safeContract.getAddress());
    console.log('Creating safe...')

    const nonce = await signer.getTransactionCount();
    console.log('Transaction count (nonce):', nonce);

    const setupCall = safeContract.encode('setup', [
      owners,
      threshold,
      ethers.constants.AddressZero,
      '0x',
      compatFallbackContract.getAddress(),
      ethers.constants.AddressZero,
      0,
      ethers.constants.AddressZero,
    ])
    const CONTRACT_NAME = 'NESTED_SAFE_3';
    const createProxyWithNonceCall = factoryContract.encode('createProxyWithNonce', [
      safeContract.getAddress(),
      setupCall,
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes(CONTRACT_NAME)),
    ])
    console.log('Create safe tx:', createProxyWithNonceCall);

    const txRequest = {
      to: factoryContract.getAddress(),
      chainId: chainId,
      data: createProxyWithNonceCall,
      nonce: nonce,
      type: 2,
    }
    console.log('TxRequest:', txRequest);
    const gas = await signer.estimateGas(txRequest)
    console.log('Gas Limit estimated:', gas);
    if (gas.lt(30000)) {
      console.warn('Too low gas estimation, is it failed?');
      return;
    }

    const relayTransaction: RelayTransaction = {
      target: factoryContract.getAddress(),
      encodedTransaction: createProxyWithNonceCall,
      chainId,
      options: {
        gasLimit: gas,
        gasToken: ethers.constants.AddressZero,
        isSponsored: sponsored,
      },
    }

    console.log('Relaying transaction on Gelato', relayTransaction)
    const response = await gelato.relayTransaction(relayTransaction);
    console.log('DONE!', response);
    return response.taskId
  }

  return { createSafe };
};