import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class RegisterDto {
    @IsEmail()
    email: string

    @IsOptional()
    @IsString()
    name?: string

    @IsString()
    password: string
}