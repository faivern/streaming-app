import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listsApi, type CreateListRequest, type UpdateListRequest, type AddListItemRequest } from "../../api/lists.api";
import type { List } from "../../types/list";

export const listKeys = {
  all: ["lists"] as const,
  detail: (id: number) => ["lists", id] as const,
};

/**
 * Fetch all lists for the current user
 */
export function useUserLists() {
  return useQuery<List[]>({
    queryKey: listKeys.all,
    queryFn: listsApi.getUserLists,
  });
}

/**
 * Fetch a single list by ID
 */
export function useListById(id?: number) {
  return useQuery<List>({
    queryKey: listKeys.detail(id!),
    queryFn: () => listsApi.getById(id!),
    enabled: Boolean(id),
  });
}

/**
 * Create a new list
 */
export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListRequest) => listsApi.create(data),
    onSuccess: (newList) => {
      queryClient.setQueryData<List[]>(listKeys.all, (old) =>
        old ? [...old, newList] : [newList]
      );
    },
  });
}

/**
 * Update an existing list
 */
export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateListRequest }) =>
      listsApi.update(id, data),
    onSuccess: (updatedList) => {
      queryClient.setQueryData<List[]>(listKeys.all, (old) =>
        old?.map((list) => (list.id === updatedList.id ? updatedList : list))
      );
      queryClient.setQueryData(listKeys.detail(updatedList.id), updatedList);
    },
  });
}

/**
 * Delete a list
 */
export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => listsApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<List[]>(listKeys.all, (old) =>
        old?.filter((list) => list.id !== deletedId)
      );
      queryClient.removeQueries({ queryKey: listKeys.detail(deletedId) });
    },
  });
}

/**
 * Add an item to a list
 * @param silent - If true, suppresses success/error toasts (caller handles feedback)
 */
export function useAddListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, item }: { listId: number; item: AddListItemRequest; silent?: boolean }) =>
      listsApi.addItem(listId, item),
    onSuccess: (updatedList) => {
      queryClient.setQueryData<List[]>(listKeys.all, (old) =>
        old?.map((list) => (list.id === updatedList.id ? updatedList : list))
      );
      queryClient.setQueryData(listKeys.detail(updatedList.id), updatedList);
    },
  });
}

/**
 * Remove an item from a list
 */
export function useRemoveListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: number; itemId: number }) =>
      listsApi.removeItem(listId, itemId),
    onSuccess: (_, { listId, itemId }) => {
      queryClient.setQueryData<List[]>(listKeys.all, (old) =>
        old?.map((list) =>
          list.id === listId
            ? { ...list, items: list.items.filter((item) => item.id !== itemId) }
            : list
        )
      );
      queryClient.setQueryData<List>(listKeys.detail(listId), (old) =>
        old ? { ...old, items: old.items.filter((item) => item.id !== itemId) } : old
      );
    },
  });
}
