import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
    InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';


@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name, { timestamp: true });
    constructor(
        private prisma: PrismaService,
        private redisService: RedisService,

    ) { }

    async create(createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const userExists = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });
        if (userExists) {
            throw new BadRequestException('Usuário com esse email já existe');
        }

        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
        });

        if (!user) {
            this.logger.error('Erro ao criar usuário');
            throw new InternalServerErrorException('Erro ao criar usuário');
        }

        await this.redisService.delete('all_users');

        const { password, ...result } = user;
        return result;
    }

    async findAll() {

        const cachedUsers = await this.redisService.get('all_users');
        if (cachedUsers) {
            return JSON.parse(cachedUsers);
        }

        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                password: false,
            },
        });

        await this.redisService.set('all_users', JSON.stringify(users), 3600000);

        return users;
    }

    async findOne(id: number) {
        const cacheKey = `user_${id}`;

        const cachedUser = await this.redisService.get(cacheKey);
        if (cachedUser) {
            return JSON.parse(cachedUser);
        }

        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                password: false,
            },
        });

        if (!user) {
            return null;
        }

        await this.redisService.set(cacheKey, JSON.stringify(user), 3600000);

        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const userExists = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!userExists) {
            throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
        }

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                password: false,
            },
        });

        if (!updatedUser) {
            this.logger.error(`Erro ao atualizar usuário com ID ${id}`);
            throw new InternalServerErrorException(`Erro ao atualizar usuário com ID ${id}`);
        }

        await this.redisService.delete(`user_${id}`);
        await this.redisService.delete('all_users');


        return updatedUser;
    }

    async remove(id: number) {
        const userExists = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!userExists) {
            throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
        }

        const deletedUser = await this.prisma.user.delete({
            where: { id },
        });

        if (!deletedUser) {
            this.logger.error(`Erro ao remover usuário com ID ${id}`);
            throw new InternalServerErrorException(`Erro ao remover usuário com ID ${id}`);
        }

        await this.redisService.delete(`user_${id}`);
        await this.redisService.delete('all_users');


        return { message: `Usuário com ID ${id} removido com sucesso` };
    }
}