import { useQuery } from "@tanstack/react-query";

interface Users {
    id: number;
    name: string;
    email: string;
    createdAt: string;
}

const getAllUsers = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`)
    return response.json()
}

const getUser = async (id: number) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${id}`)
    return response.json()
}


export const useGetAllUsers = () => {
    return useQuery<Users[]>({
        queryKey: ["users"],
        queryFn: () => getAllUsers()
    })
}

export const useGetUserById = (id: number) => {
    return useQuery<Users>({
        queryKey: ["users", id],
        queryFn: () => getUser(id)
    })
}