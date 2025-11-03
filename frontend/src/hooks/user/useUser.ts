//hook
import { useQuery } from "@tanstack/react-query";
import { getUserCredentials } from "../../api/user.api";
import type { User } from "../../types/user";

export function useUser() {
  return useQuery<User | null>({
    queryKey: ["me"],
    queryFn: getUserCredentials,
    retry: false,
  });
}
