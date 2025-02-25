import { queryClient } from "@/app/(root)/users/layout";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";



const createUser = async (data: { name: string, email: string, password: string }) => {
    if (!data.name || !data.email || !data.password) {
        throw new Error("Missing required fields")
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    return response.json()
}


export const useCreateUser = () => {
    return useMutation({
        mutationFn: async (data: { name: string, email: string, password: string }) => {
            const response = await createUser(data);
            return response;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["users"],
            });
            toast.success("Usuário cadastrado com sucesso!");
        },
        onError: (error) => {
            toast.error(error.message);
        }
    })
}