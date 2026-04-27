import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async createUser(username: string, email: string, password: string) {
        try {
            console.log("Creating user with username:", username, "email:", email);
            const exists = await this.prisma.user.findFirst({
                where: {
                    OR: [{ username }, { email }]
                }
            });
            console.log("hihi");

            if (exists) throw new ConflictException('Username hoặc email đã tồn tại');

            const password_hash = await bcrypt.hash(password, 10);

            const user = await this.prisma.user.create({
                data: { username, email, password_hash },
                select: { id: true, username: true, email: true, role: true, created_at: true },
            });

            return user;
        }catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }

    }

    async findUserByUsername(username: string) {
        return await this.prisma.user.findUnique({
            where: { username },
        })
    }

    async findUserByEmail(email: string) {
        return await this.prisma.user.findUnique({
            where: { email },
        })
    }

    async getAllUsers() {
        return await this.prisma.user.findMany({
            select: { id: true, username: true, email: true, role: true, created_at: true },
        });
    }
}