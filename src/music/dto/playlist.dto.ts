import { IsArray, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';
import { MusicDto } from "./music.dto";
import { CreatePlaylistDto } from "src/user/dto/playlist.dto";

export class playlistDto {
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => CreatePlaylistDto)
    playlistList: CreatePlaylistDto[]
}