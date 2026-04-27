import { Body, Controller, Post, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        console.log("hehe");
        const rs = await this.authService.register(dto.username, dto.email, dto.password);
        console.log("register result:", rs);
        return rs;
    }
    
    @UseGuards(AuthGuard('local'))
    @Post('login')
    login(@Request() req) {
        return this.authService.login(req.user.email);
    }
}