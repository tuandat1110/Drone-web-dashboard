import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { time } from "console";
import { timestamp } from "rxjs";
import { UserService } from "src/users/user.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}

    async register(username: string, email: string, password: string) {
        try {
            console.log("registering user:", username, email);
            const rs =  await this.userService.createUser(username, email, password);
            console.log("register result:", rs);
            return rs;
        } catch(error) {
            console.error("Error in register:", error);
            throw error;
        }
    }

    async login(email: string) {
        //const user = await this.validateUser(email, password);
        const user = await this.userService.findUserByEmail(email);
        const payload = { username: user?.username, sub: user?.id, role: user?.role, timestamp: Date.now() };
        return {
            access_token: this.jwtService.sign(payload),
            user: { id: user?.id, username: user?.username, email: user?.email },
        }
    }

    
    async validateUser(email: string, password: string) {
        const user = await this.userService.findUserByEmail(email);
        if(!user)  throw new UnauthorizedException('Sai username hoặc password');

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if(!isMatch) throw new UnauthorizedException('Sai username hoặc password');
        
        const { password_hash, ...result } = user;
        return result;
    }
}