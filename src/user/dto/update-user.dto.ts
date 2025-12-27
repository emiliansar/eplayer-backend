import { IsString } from "class-validator";

export class UserUpdateDto {
    @IsString()
    name: string

    @IsString()
    description: string
}