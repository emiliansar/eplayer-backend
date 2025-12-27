import { IsNumber, IsString } from "class-validator";

export class MusicDto {
    @IsString()
    title: string

    @IsString()
    description: string

    @IsString()
    id: string
}