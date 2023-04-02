import { AuthStatus } from "@/components/useAuth";
import { useUserContext } from "@/context/user";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function LoginPage() {
  const { signin, status } = useUserContext();
  const router = useRouter()

  useEffect(() => {
    if (status === AuthStatus.SIGNED_IN) {
      router.push('/app');
    }
  }, [status]);

  return (
    <>
      <Head>
        <title>Home page</title>
      </Head>
      <main>
        <h1>Lifeline</h1>
        <button onClick={signin} disabled={status !== AuthStatus.READY}>Signin</button>
      </main>
    </>
  )
}
