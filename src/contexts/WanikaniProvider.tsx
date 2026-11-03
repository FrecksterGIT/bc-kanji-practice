import { FC, PropsWithChildren, use } from "react";
import { useSession } from "../hooks/useSession.ts";
import { getSync } from "../utils/wkSync.ts";

export const WanikaniProvider: FC<PropsWithChildren> = ({ children }) => {
  const { apiKey, isLoggedIn } = useSession();

  if (isLoggedIn) use(getSync(apiKey));

  return children;
};
