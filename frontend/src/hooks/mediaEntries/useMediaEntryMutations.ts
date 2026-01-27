import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { mediaEntriesApi } from "../../api/mediaEntries.api";
import type {
  CreateMediaEntryRequest,
  UpdateMediaEntryRequest,
  UpsertReviewRequest,
} from "../../api/mediaEntries.api";

type ApiError = Error & { response?: { status?: number } };

export function useCreateMediaEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMediaEntryRequest) => mediaEntriesApi.create(data),
    onSuccess: () => {
      toast.success("Entry created!");
      queryClient.invalidateQueries({ queryKey: ["mediaEntries"] });
    },
    onError: (error: ApiError) => {
      if (error.response?.status === 401) {
        toast.error("Please sign in");
      } else if (error.response?.status === 409) {
        toast.error("Entry already exists");
      } else {
        toast.error("Failed to create entry");
      }
    },
  }); 
}

export function useUpdateMediaEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMediaEntryRequest }) =>
      mediaEntriesApi.update(id, data),
    onSuccess: () => {
      toast.success("Entry updated!");
      queryClient.invalidateQueries({ queryKey: ["mediaEntries"] });
    },
    onError: (error: ApiError) => {
      if (error.response?.status === 401) {
        toast.error("Please sign in");
      } else if (error.response?.status === 404) {
        toast.error("Entry not found");
      } else {
        toast.error("Failed to update entry");
      }
    },
  });
}

export function useDeleteMediaEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => mediaEntriesApi.delete(id),
    onSuccess: () => {
      toast.success("Removed from library");
      queryClient.invalidateQueries({ queryKey: ["mediaEntries"] });
    },
    onError: (error: ApiError) => {
      if (error.response?.status === 401) {
        toast.error("Please sign in");
      } else if (error.response?.status === 404) {
        toast.error("Entry not found");
      } else {
        toast.error("Failed to delete entry");
      }
    },
  });
}

export function useUpsertReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      data,
    }: {
      entryId: number;
      data: UpsertReviewRequest;
    }) => mediaEntriesApi.upsertReview(entryId, data),
    onSuccess: () => {
      toast.success("Review saved!");
      queryClient.invalidateQueries({ queryKey: ["mediaEntries"] });
    },
    onError: (error: ApiError) => {
      if (error.response?.status === 401) {
        toast.error("Please sign in");
      } else if (error.response?.status === 404) {
        toast.error("Entry not found");
      } else {
        toast.error("Failed to save review");
      }
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: number) => mediaEntriesApi.deleteReview(entryId),
    onSuccess: () => {
      toast.success("Review deleted");
      queryClient.invalidateQueries({ queryKey: ["mediaEntries"] });
    },
    onError: (error: ApiError) => {
      if (error.response?.status === 401) {
        toast.error("Please sign in");
      } else if (error.response?.status === 404) {
        toast.error("Review not found");
      } else {
        toast.error("Failed to delete review");
      }
    },
  });
}
