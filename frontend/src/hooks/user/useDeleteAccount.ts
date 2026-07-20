import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAccount } from "../../api/user.api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
      toast.success("Your account and data have been deleted");
      navigate("/");
    },
    onError: (error) => {
      console.error("Account deletion failed:", error);
      toast.error("Failed to delete account");
    },
  });
}
