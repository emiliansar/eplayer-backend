import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePlaylistDto {
    @IsString()
    name: string

    @IsOptional()
    @IsString()
    description: string

    @IsBoolean()
    access: boolean

    @IsOptional()
    @IsNumber()
    newItem: number
}

export class UpdatePlayListDto {
    @IsNumber()
    id: number

    @IsOptional()
    @IsString()
    name: string

    @IsOptional()
    @IsString()
    description: string

    @IsNumber()
    userId: number

    @IsOptional()
    @IsBoolean()
    access: boolean

    @IsOptional()
    @IsNumber()
    newItem: number
}