import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';

const mockPrismaService = {
    user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
};

describe('UsersService', () => {
    let service: UsersService;
    let prisma: PrismaService;
    let cacheManager: RedisService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: RedisService, useValue: mockCacheManager },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prisma = module.get<PrismaService>(PrismaService);
        cacheManager = module.get<RedisService>(RedisService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const createUserDto: CreateUserDto = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            };

            const createdUser = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashed_password',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password' as never);
            mockPrismaService.user.create.mockResolvedValue(createdUser);

            const result = await service.create(createUserDto);

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(mockPrismaService.user.create).toHaveBeenCalledWith({
                data: {
                    ...createUserDto,
                    password: 'hashed_password',
                },
            });
            expect(mockCacheManager.delete).toHaveBeenCalledWith('all_users');
            expect(result).not.toHaveProperty('password');
            expect(result).toEqual({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            });
        });
    });

    describe('findAll', () => {
        it('should return all users without passwords', async () => {
            const users = [
                {
                    id: 1,
                    name: 'User 1',
                    email: 'user1@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 2,
                    name: 'User 2',
                    email: 'user2@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            mockPrismaService.user.findMany.mockResolvedValue(users);

            const result = await service.findAll();
            expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    updatedAt: true,
                    password: false,
                },
            });
            expect(result).toEqual(users);
        });
    });

    describe('findOne', () => {
        it('should return a user by id without password', async () => {
            const user = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrismaService.user.findUnique.mockResolvedValue(user);

            const result = await service.findOne(1);

            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    updatedAt: true,
                    password: false,
                },
            });
            expect(result).toEqual(user);
        });

        it('should return null when user does not exist', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            const result = await service.findOne(999);

            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('should update a user by id', async () => {
            const updateUserDto: UpdateUserDto = {
                name: 'Updated Name',
            };

            const existingUser = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashed_password',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const updatedUser = {
                id: 1,
                name: 'Updated Name',
                email: 'test@example.com',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
            mockPrismaService.user.update.mockResolvedValue(updatedUser);

            const result = await service.update(1, updateUserDto);

            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(mockPrismaService.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
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
            expect(mockCacheManager.delete).toHaveBeenCalledWith('all_users');
            expect(mockCacheManager.delete).toHaveBeenCalledWith('user_1');
            expect(result).toEqual(updatedUser);
        });

        it('should hash password when updating password', async () => {
            const updateUserDto: UpdateUserDto = {
                password: 'new_password',
            };

            const existingUser = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                password: 'old_hashed_password',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const updatedUser = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(bcrypt, 'hash').mockResolvedValue('new_hashed_password' as never);
            mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
            mockPrismaService.user.update.mockResolvedValue(updatedUser);

            const result = await service.update(1, updateUserDto);


            expect(bcrypt.hash).toHaveBeenCalledWith('new_password', 10);
            expect(mockPrismaService.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { password: 'new_hashed_password' },
                select: expect.any(Object),
            });
            expect(result).toEqual(updatedUser);
        });
    });

    describe('remove', () => {
        it('should remove a user by id', async () => {

            const existingUser = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashed_password',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
            mockPrismaService.user.delete.mockResolvedValue(existingUser);

            const result = await service.remove(1);

            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(mockCacheManager.delete).toHaveBeenCalledWith('all_users');
            expect(mockCacheManager.delete).toHaveBeenCalledWith('user_1');
            expect(result).toEqual({ message: 'Usuário com ID 1 removido com sucesso' });
        });
    });
});