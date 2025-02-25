"use client"
import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateUser } from '@/hooks/mutations/useCreateUser'


const formSchema = z.object({
    name: z.string().min(2, {
        message: "Nome deve ter no mínimo 2 caracteres.",
    }),
    email: z.string().email({
        message: "Email inválido.",
    }),
    password: z.string().min(6, {
        message: "Senha deve ter no mínimo 6 caracteres.",
    }),
})


const AddUsersPage = () => {

    const {
        mutate: createUser,
        isPending,
        isSuccess
    } = useCreateUser();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        createUser(values);
        if (isSuccess) {
            form.reset();
        }

    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex space-x-2 mt-10 ml-10 ">
                <Card className='w-full max-w-2xl items-center justify-center'>
                    <CardHeader>
                        <CardTitle>Cadastrar Usuário</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input placeholder="seu nome" {...field} />
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
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">{isPending ? "Carregando..." : "Cadastrar Usuário"}</Button>
                    </CardContent>
                </Card>
            </form>

        </Form>
    )
}

export default AddUsersPage