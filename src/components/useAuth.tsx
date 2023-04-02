import { SafeAuthKit, SafeAuthProviderType, SafeAuthSignInData } from "@safe-global/auth-kit";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

export enum AuthStatus {
  PREPARING,
  READY,
  SIGNED_IN,
}

export const useAuth = () => {
  const RPC_URL = 'https://optimism-goerli.public.blastapi.io';
  const WEB3AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ?? '';
  const CHAIN_ID = 420

  const [status, setStatus] = useState<AuthStatus>(AuthStatus.PREPARING);
  const [auth, setAuth] = useState<SafeAuthKit | null>(null);
  const [user, setUser] = useState<SafeAuthSignInData | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  async function init() {
    console.log('Initializing Safe Auth...');
    const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
      chainId: ethers.BigNumber.from(CHAIN_ID).toHexString(),
      authProviderConfig: {
        rpcTarget: RPC_URL, // Add your RPC e.g. https://goerli.infura.io/v3/<your project id>
        clientId: WEB3AUTH_CLIENT_ID, // Add your client id. Get it from the Web3Auth dashboard
        network: 'testnet', // The network to use for the Web3Auth modal. Use 'testnet' while developing and 'mainnet' for production use
        theme: 'auto', // The theme to use for the Web3Auth modal,
      }
    })

    if (!safeAuthKit) {
      alert('unable to initiate Safe auth SDK')
      return;
    }
    setAuth(safeAuthKit);
    setStatus(AuthStatus.READY);
  }

  async function signin() {
    if (!auth) {
      console.log('Auth has not been initiated yet');
      alert('Auth has not been initiated yet');
      return;
    }
    console.log('Signing in...');
    const user = await auth.signIn()
    console.log('USER:', user);

    const safeProvider = auth.getProvider();
    if (!safeProvider) {
      alert('cannot sign message: safe provider not found')
      return;
    }

    const provider = new ethers.providers.Web3Provider(safeProvider);

    setUser(user);
    setStatus(AuthStatus.SIGNED_IN);
    setProvider(provider);
  }

  async function signout() {
    if (!auth) {
      console.log('Auth has not been initiated yet');
      alert('Auth has not been initiated yet');
      return;
    }
    console.log('Signing out...');
    await auth.signOut()

    setStatus(AuthStatus.READY);
    setUser(null);
    setProvider(null);
  }

  useEffect(() => {
    init();
  }, []);

  return {signin, signout, kit: auth, user, status, provider, chainId: CHAIN_ID};
};