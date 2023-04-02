import { AuthStatus, useAuth } from "@/components/useAuth";
import { SafeAuthKit, SafeAuthSignInData } from "@safe-global/auth-kit";
import { ethers } from "ethers";
import { createContext, useContext, FC, PropsWithChildren } from "react";

export interface User {
  user: SafeAuthSignInData | null;
  kit: SafeAuthKit | null;
  status: AuthStatus;
  signin: () => Promise<void>;
  signout: () => Promise<void>;
  provider: ethers.providers.Web3Provider | null;
  chainId: number;
}

const Context = createContext<User>({
  status: AuthStatus.PREPARING,
  kit: null,
  signin: async () => { },
  signout: async () => { },
  user: null,
  provider: null,
  chainId: 1,
});

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const { user, kit, status, provider, chainId, signin, signout } = useAuth();

  return (
    <Context.Provider value={{ user, kit, status, signin, signout, provider, chainId }}>{children}</Context.Provider>
  );
}

export function useUserContext() {
  return useContext(Context);
}