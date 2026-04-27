import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString() @MinLength(6)
    password: string;

    constructor(username: string, email: string, password: string) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
}

export class LoginDto {
    @IsEmail() 
    email: string;

    @IsString() 
    password: string;

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }
}