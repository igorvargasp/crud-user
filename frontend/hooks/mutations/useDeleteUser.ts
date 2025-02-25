
import { queryClient } from "@/app/(root)/users/layout";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";


const deleteUser = async (id: number) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    })
    return response.json()
}


export const useDeleteUser = () => {
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await deleteUser(id);
            return response;
        },
        onSuccess: (_data) => {
            queryClient.invalidateQueries({
                queryKey: ["users"],
            });
            toast.success("Usuário excluído com sucesso!");
        },
        onError: (error) => {
            toast.error(error.message);
        }
    })
}