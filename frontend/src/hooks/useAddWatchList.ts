import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import watchlistApi, { type AddWatchlistRequest } from "../api/watchlist.api";

export default function useAddWatchList() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (item: AddWatchlistRequest) => watchlistApi.addToWatchlist(item),
    onSuccess: () => {
      toast.success("Added to Watchlist!");
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
    onError: (error: Error & { response?: { status?: number } }) => {
      if (error.response?.status === 409) {
        toast.error("Already in your watchlist");
      } else if (error.response?.status === 401) {
        toast.error("Please sign in to use watchlist");
      } else {
        toast.error("Failed to add to watchlist");
      }
    },
  });

  return (item: AddWatchlistRequest) => {
    mutation.mutate(item);
  };
}
