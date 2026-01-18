import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postLogoutUser } from "../../api/user.api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: postLogoutUser,
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
      toast.success("Logged out successfully");
      navigate("/");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    },
  });
}
