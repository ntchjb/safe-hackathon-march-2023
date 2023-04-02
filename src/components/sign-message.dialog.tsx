import { useUserContext } from "@/context/user";
import { ChangeEventHandler, useState } from "react";

export default function SignMessageDialog() {
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const { user, provider } = useUserContext();

  const handleMessageChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setMessage(e.target.value);
  }

  async function signMessage() {
    if (!provider) {
      alert('ethersjs provider not exist')
      return;
    }
    const signer = provider.getSigner();
    const result = await signer.signMessage(message);

    setSignature(result);
  }

  return (
    <div>
      <div>
        <input type="text" onChange={handleMessageChange} value={message} />
      </div>
      <div>
        <button onClick={signMessage}>Sign message</button>
      </div>
      <div>
        <input type="text" disabled value={signature} />
      </div>
    </div>
  );
}