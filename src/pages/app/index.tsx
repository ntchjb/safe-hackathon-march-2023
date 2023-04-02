import SignMessageDialog from "@/components/sign-message.dialog";
import { useUserContext } from "@/context/user";
import FundingSafeForm from '@/components/funding-safe.form';
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";

export default function MainPage() {
  const { signout, user, provider } = useUserContext();
  const router = useRouter();

  const [balance, setBalance] = useState('');

  useEffect(() => {
    async function getETHBalance() {
      if (!provider) {
        alert('no ethersjs provider');
        return;
      }
      if (!user) {
        setBalance('');
        return;
      }
      const balance = await provider.getBalance(user.eoa);

      setBalance(ethers.utils.formatEther(balance));
    }

    getETHBalance();
    console.log('Fetching balance...')
  }, [user]);

  async function handleSignout() {
    await signout();

    router.push('/login');
  }

  return (
    <div>
      <h1>Lifeline: Main page</h1>
      <button onClick={signout}>Signout</button>
      <p>User: {user?.eoa ?? '<Not signed in>'}</p>
      <p>Balance: {balance} ETH</p>
      <div>
        <SignMessageDialog />
      </div>
      <div>
        <FundingSafeForm />
      </div>
    </div>
  );
}
