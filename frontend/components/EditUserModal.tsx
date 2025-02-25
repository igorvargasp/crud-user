import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { useGetUserById } from "@/hooks/queries/useGetUser"
import { use, useEffect, useState } from "react"
import { useUpdateUser } from "@/hooks/mutations/useUpdateUser"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Nome deve ter no mínimo 2 caracteres.",
    }),
    email: z.string().email({
        message: "Email inválido.",
    }),
})


export function EditUserModal({ user, hanleOpenChange, openModal }: {
    user: {
        id: number;
        name: string;
        email: string;
        createdAt: string;
    },
    hanleOpenChange: (open: boolean) => void
    openModal: boolean;
}) {

    const {
        data: userData,
        isLoading,
    } = useGetUserById(user.id);


    const {
        mutate: updateUser,
        isPending,
        isSuccess
    } = useUpdateUser();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: userData?.name ?? "",
            email: userData?.name ?? "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        updateUser({
            email: values.email,
            name: values.name,
            id: user.id,
        });

        if (isSuccess) {
            hanleOpenChange(false);
        }
    }

    useEffect(() => {
        if (!isLoading && userData) {
            form.reset({
                name: userData.name,
                email: userData.email,
            });
        }
    }, [isLoading]);

    if (isLoading) {
        return <div>Loading...</div>
    }


    return (
        <Form {...form}>
            <Dialog onOpenChange={hanleOpenChange} open={openModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Editar {userData?.name}</DialogTitle>
                        <DialogDescription>
                            Editar informações do usuário e salvar as alterações.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 flex mt-1 flex-col">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input placeholder="seu nome"  {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="seu@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">{
                                isPending ? "Salvando..." : "Salvar"
                            }</Button>
                        </DialogFooter>
                    </form>

                </DialogContent>
            </Dialog>
        </Form>
    )
}
