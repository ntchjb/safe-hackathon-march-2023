import { useUserContext } from "@/context/user";
import { GelatoRelayAdapter } from "@safe-global/relay-kit";
import { SafeAccountConfig, SafeFactory } from "@safe-global/safe-core-sdk";
import EthersAdapter from "@safe-global/safe-ethers-lib";
import SafeServiceClient from "@safe-global/safe-service-client";
import { ethers } from "ethers";
import { ChangeEventHandler, useState } from "react"
import FundingSafeResultDialog from "./funding-safe-result.box";
import { useCreateSafe } from "./useCreateSafe";

export default function FundingSafeForm() {
  const { user, provider } = useUserContext();
  const { createSafe } = useCreateSafe();
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [fundingSafeAddress, setFundingSafeAddress] = useState('');
  const [taskId, setTaskId] = useState('');

  const handleUser2InputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setUser2(e.target.value);
  }
  const handleUser1InputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setUser1(e.target.value);
  }

  const handleTaskIdInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setTaskId(e.target.value);
  }

  async function initiateCreatingFundingSafe() {
    if (!user) {
      alert('No user info, please login first')
      return;
    }
    const resultTaskId = await createSafe([user1, user2], 1, true)
    setTaskId(resultTaskId ?? '<done>');
  }

  function gelatoLink() {
    return (
      <a href={`https://relay.gelato.digital/tasks/status/${taskId}`}> {'--->'} Gelato Task Status {'<---'}</a>
    );
  }

  return (
    <div>
      <p>User 1:</p>
      <input type="text" value={user1} onChange={handleUser1InputChange}/>
      <p>User 2:</p>
      <input type="text" value={user2} onChange={handleUser2InputChange} />
      <button onClick={initiateCreatingFundingSafe}>Create Funding Safe</button>
      <div>
        <p>Gelato link:</p>
      {taskId ? gelatoLink() : null}
      </div>

      {fundingSafeAddress ? <FundingSafeResultDialog address={fundingSafeAddress} /> : null}
    </div>
  )
}