"use client"
import React, { useState } from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { useGetAllUsers } from '@/hooks/queries/useGetUser'
import { useDeleteUser } from '@/hooks/mutations/useDeleteUser'
import { EditUserModal } from '@/components/EditUserModal'


const EditUsersPage = () => {

    const { data: users } = useGetAllUsers();
    const { mutate: deleteUser } = useDeleteUser();
    const [editUser, setEditUser] = useState<{
        id: number;
        name: string;
        email: string;
        createdAt: string;
    } | null>(null);
    const [open, setOpen] = useState(false);


    const formatDate = (date: string) => {
        const dateObject = new Date(date);
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        return dateObject.toLocaleDateString("pt-BR", options);
    };

    const handleOpenChange = (open: boolean) => {
        setOpen(open);
    };


    return (
        <section className="flex w-full h-full">
            <div className='w-full items-center justify-center p-10 overflow-x-hidden overflow-scroll h-[calc(100vh-theme(spacing.16))]'>
                <Table>
                    <TableCaption>Lista de usuários cadastrados</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Data de cadastro</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users && Object.values(users ?? {}).map((user, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                    <div className='space-x-2'>
                                        <Button className="text-sm text-primary-foreground bg-green-600" variant={"default"} onClick={() => {
                                            handleOpenChange(true)
                                            setEditUser(user)
                                        }}>Editar</Button>
                                        <Button className="text-sm text-primary-foreground" variant={"destructive"} onClick={() => deleteUser(user.id)}>Excluir</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {editUser && <EditUserModal user={editUser} hanleOpenChange={handleOpenChange} openModal={open} />}
            </div>
        </section>
    )
}

export default EditUsersPage