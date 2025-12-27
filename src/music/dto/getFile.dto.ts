import { IsString } from "class-validator";

export class getFileDto {
    @IsString()
    path: string
}