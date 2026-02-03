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
    mutationFn: (data: CreateMediaEntryRequest & { silent?: boolean }) => mediaEntriesApi.create(data),
    onSuccess: (_data, { silent }) => {
      if (!silent) {
        toast.success("Added to library!");
      }
      queryClient.invalidateQueries({ queryKey: ["mediaEntries"] });
    },
    onError: (error: ApiError, { silent }) => {
      if (silent) return;
      if (error.response?.status === 401) {
        toast.error("Please sign in");
      } else if (error.response?.status === 409) {
        toast.error("Already in your library");
      } else {
        toast.error("Failed to add to library");
      }
    },
  });
}

export function useUpdateMediaEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMediaEntryRequest; silent?: boolean }) =>
      mediaEntriesApi.update(id, data),
    onSuccess: (_data, { silent }) => {
      if (!silent) {
        toast.success("Library updated!");
      }
      queryClient.invalidateQueries({ queryKey: ["mediaEntries"] });
    },
    onError: (error: ApiError, { silent }) => {
      if (silent) return;
      if (error.response?.status === 401) {
        toast.error("Please sign in");
      } else if (error.response?.status === 404) {
        toast.error("Entry not found");
      } else {
        toast.error("Failed to update");
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
      silent?: boolean;
    }) => mediaEntriesApi.upsertReview(entryId, data),
    onSuccess: (_data, { silent }) => {
      if (!silent) {
        toast.success("Review saved!");
      }
      queryClient.invalidateQueries({ queryKey: ["mediaEntries"] });
    },
    onError: (error: ApiError, { silent }) => {
      if (silent) return;
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
