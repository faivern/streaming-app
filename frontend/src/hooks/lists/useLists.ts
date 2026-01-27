import { useQuery } from "@tanstack/react-query";
import { listsApi } from "../../api/lists.api";
import type { List } from "../../types/list";

export function useUserLists() {
  return useQuery<List[]>({
    queryKey: ["lists"],
    queryFn: listsApi.getUserLists,
  });
}

export function useListById(id?: number) {
  return useQuery<List>({
    queryKey: ["lists", id],
    queryFn: () => listsApi.getById(id!),
    enabled: Boolean(id),
  });
}
