import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { RegisterDto } from "src/auth/dto/auth.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Post()
    async createUser(@Body() dto: RegisterDto) { 
        return this.userService.createUser(dto.username, dto.email, dto.password);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAllUsers() {
        return await this.userService.getAllUsers();
    }
    
}