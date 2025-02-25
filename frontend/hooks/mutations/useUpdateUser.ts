
import { queryClient } from "@/app/(root)/users/layout";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";



const updateUser = async (id: number, data: { name: string, email: string }) => {
    if (!data.name || !data.email) {
        throw new Error("Missing required fields")
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    return response.json()
}

export const useUpdateUser = () => {
    return useMutation({
        mutationFn: async (data: { id: number, name: string, email: string }) => {
            const response = await updateUser(data.id, {
                email: data.email,
                name: data.name,
            });
            return response;
        },
        onSuccess: (_data) => {
            queryClient.invalidateQueries({
                queryKey: ["users"],
            });
            toast.success("Usuário atualizado com sucesso!");
        },
        onError: (error) => {
            toast.error(error.message);
        }
    })
}