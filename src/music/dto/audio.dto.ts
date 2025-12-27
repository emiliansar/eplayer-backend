import { IsArray, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';
import { MusicDto } from "./music.dto";

export class audioDto {
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => MusicDto)
    audioList: MusicDto[]
}