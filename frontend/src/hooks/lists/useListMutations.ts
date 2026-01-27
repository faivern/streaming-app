import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { listsApi } from "../../api/lists.api";
import type { CreateListRequest, UpdateListRequest, AddListItemRequest } from "../../api/lists.api";

type ApiError = Error & { response?: { status?: number } };

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListRequest) => listsApi.create(data),
    onSuccess: () => {
      toast.success("List created!");
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
    onError: (error: ApiError) => {
      if (error.response?.status === 401) {
        toast.error("Please sign in to create lists");
      } else {
        toast.error("Failed to create list");
      }
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateListRequest }) =>
      listsApi.update(id, data),
    onSuccess: () => {
      toast.success("List updated!");
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
    onError: (error: ApiError) => {
      if (error.response?.status === 401) {
        toast.error("Please sign in");
      } else if (error.response?.status === 404) {
        toast.error("List not found");
      } else {
        toast.error("Failed to update list");
      }
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => listsApi.delete(id),
    onSuccess: () => {
      toast.success("List deleted");
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
    onError: (error: ApiError) => {
      if (error.response?.status === 401) {
        toast.error("Please sign in");
      } else if (error.response?.status === 404) {
        toast.error("List not found");
      } else {
        toast.error("Failed to delete list");
      }
    },
  });
}

export function useAddListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, item }: { listId: number; item: AddListItemRequest }) =>
      listsApi.addItem(listId, item),
    onSuccess: (_data, { listId }) => {
      toast.success("Added to list!");
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["lists", listId] });
    },
    onError: (error: ApiError) => {
      if (error.response?.status === 401) {
        toast.error("Please sign in");
      } else if (error.response?.status === 409) {
        toast.error("Item already exists in this list");
      } else if (error.response?.status === 404) {
        toast.error("List not found");
      } else {
        toast.error("Failed to add item");
      }
    },
  });
}

export function useRemoveListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: number; itemId: number }) =>
      listsApi.removeItem(listId, itemId),
    onSuccess: (_data, { listId }) => {
      toast.success("Removed from list");
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["lists", listId] });
    },
    onError: (error: ApiError) => {
      if (error.response?.status === 401) {
        toast.error("Please sign in");
      } else if (error.response?.status === 404) {
        toast.error("Item not found");
      } else {
        toast.error("Failed to remove item");
      }
    },
  });
}
