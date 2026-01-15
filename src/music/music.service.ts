import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MusicDto } from './dto/music.dto';
import { Express } from 'express';
import { PrismaService } from 'src/prisma.service';
import { existsSync, mkdirSync, renameSync, unlink, unlinkSync } from 'fs';
import path, { extname } from "path";
import { v4 as uuidv4 } from 'uuid';
import { Music, Playlist } from 'prisma/generated';
import { audioDto } from './dto/audio.dto';
import { subListDto } from './dto/subList.dto';
import { plainToInstance } from 'class-transformer';
import { playlistDto } from './dto/playlist.dto';
import { CreatePlaylistDto } from 'src/user/dto/playlist.dto';

@Injectable()
export class MusicService {
    constructor(
        private prisma: PrismaService
    ) {}

    async getMetaData(musicId: string) {
        if (!musicId || isNaN(+musicId)) throw new BadRequestException("Некорректный идентификатор музыкального произведения");
        console.log("Service musicId: ", musicId);

        const music =  await this.prisma.music.findUnique({
            where: {
                id: +musicId
            }
        });
        console.log("music is: ", music)
        if (!music) throw new NotFoundException("Такого муз. произведения нету");
        console.log("Отдаю на клиент music: ", music);

        return music;
    }

    async getPlaylistData(playlistId: string) {
        if (!playlistId) throw new BadRequestException("Некорректный идентификатор плейлиста");

        const playlistIdNumber = parseInt(playlistId, 10)

        if (isNaN(playlistIdNumber)) {
            throw new BadRequestException("Некорректный идентификатор плейлиста")
        }

        const playlist = await this.prisma.playlist.findUnique({
            where: {
                id: playlistIdNumber
            }
        });
        if (!playlist) throw new NotFoundException("Такого плейлиста не существует")

        return playlist;
    }

    async uploadFile(
        files: {
            preview?: Express.Multer.File[];
            audio: Express.Multer.File[];
        },
        dto: MusicDto
    ) {
        try {
            if (!dto.id) throw new BadRequestException("ИД пользователя обязателен!!!");
            if (!dto.title) throw new BadRequestException("Название обязательно");

            if (!files.audio?.[0]) {
                throw new BadRequestException("Айдиофайл обязателен");
            }
            
            const previewFile = this.saveFile(files.preview?.[0], 'images');
            const audioFile = this.saveFile(files.audio[0], 'music');

            if (!audioFile) {
                throw new Error("Не удалось сохранить аудиофайл");
            }

            return await this.prisma.music.create({
                data: {
                    preview: previewFile,
                    title: dto.title,
                    description: dto.description,
                    authorId: +dto.id,
                    path: audioFile
                }
            });
        } catch (error) {
            if (files.preview?.[0].path) unlinkSync(files.preview[0].path);
            if (files.audio?.[0]?.path) unlinkSync(files.audio[0].path);
            throw error;
        }
    }

    async deleteFile(userId: number, musicId: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: +userId
            }
        });
        if (!user) throw new NotFoundException("Пользователь с таким ИД не найден")
        
        const music = await this.prisma.music.findUnique({
            where: {
                id: +musicId
            }
        });
        if (!music) throw new NotFoundException("Такого произведения не существует")
        
        if (music.preview) {
            try {
                unlinkSync('/app/uploads/images/' + music.preview)
            } catch (error) {
                throw error;
            }
        }
        if (music.path) {
            try {
                unlinkSync('/app/uploads/music/' + music.path)
            } catch (error) {
                throw error;
            }
        }

        const deleteHistory = await this.prisma.history.deleteMany({
            where: {
                musicId: music.id
            }
        })
        
        const deleteMusic = await this.prisma.music.delete({
            where: {
                id: music.id
            }
        });
    }

    async getAos(userId: number, dto: subListDto): Promise<audioDto> {
        if (!userId) throw new Error("ИД пользователя обязателен")
        if (dto.subList?.length === 0) throw new Error ("Подписок нет")
        let quantityTake = 2;

        if (dto.subList.length >= 8) null;
        if (
            dto.subList.length < 8
            && dto.subList.length >= 4
        ) quantityTake = 4;
        if (
            dto.subList.length < 4
            && dto.subList.length >= 2
        ) quantityTake = 8;
        if (dto.subList.length < 2) quantityTake = 16;

        const aosList: Music[] = [];

        for (const authorId of dto.subList) {
            const music: Music[] = await this.prisma.music.findMany({
                where: {
                    authorId
                },
                take: quantityTake,
            })
            if (!music || music.length === 0) continue;

            music.forEach(item => {
                aosList.push(item)
            });
        }
        if (aosList.length < 16) {
            const moreMusic: Music[] = await this.prisma.music.findMany({
                take: 16 - aosList.length
            });

            moreMusic.forEach(item => {
                aosList.push(item)
            });
        }

        const musicDtos = plainToInstance(MusicDto, aosList);
        const result = new audioDto();
        result.audioList = musicDtos;

        return result;
    }

    async getPos(userId: number, dto: subListDto): Promise<playlistDto> {
        if (!userId) throw new Error("ИД пользователя обязателен")
        if (dto.subList?.length === 0) throw new Error ("Подписок нет")
        let quantityTake = 1;

        if (dto.subList.length >= 8) null;
        if (
            dto.subList.length < 8
            && dto.subList.length >= 4
        ) quantityTake = 2;
        if (
            dto.subList.length < 4
            && dto.subList.length >= 2
        ) quantityTake = 4;
        if (dto.subList.length < 2) quantityTake = 8;

        const posList: Playlist[] = [];

        for (const authorId of dto.subList) {
            const playlists: Playlist[] = await this.prisma.playlist.findMany({
                where: {
                    authorId,
                    access: true
                },
                take: quantityTake,
            })
            if (!playlists || playlists.length === 0) continue;

            playlists.forEach(item => {
                posList.push(item)
            });
        }

        if (posList.length < 8) {
            const morePlaylists = await this.prisma.playlist.findMany({
                take: 8 - posList.length
            });

            morePlaylists.forEach(item => {
                posList.push(item)
            })
        }

        const playlistsDtos = plainToInstance(CreatePlaylistDto, posList);
        const result = new playlistDto();
        result.playlistList = playlistsDtos;

        return result;
    }

    async getTakeFromA(dto: {
        takeFrom: number,
        target: number
    }): Promise<audioDto> {
        const tfaList: Music[] = [];

        const music: Music[] = await this.prisma.music.findMany({
            skip: dto.takeFrom,
            take: dto.target,
        });

        // console.log("music: ", music)

        music.forEach(item => {
            tfaList.push(item)
        })

        const musicDtos = plainToInstance(MusicDto, tfaList);
        const result = new audioDto();
        result.audioList = musicDtos;

        console.log("typeof result: ", typeof result)

        return result;
    }

    async getTakeFromP(dto: { takeFrom: number }): Promise<playlistDto> {
        const tfpList: Playlist[] = [];

        const playlists: Playlist[] = await this.prisma.playlist.findMany({
            skip: dto.takeFrom,
            take: 8,
        });

        playlists.forEach(item => {
            tfpList.push(item)
        })

        const playlistsDtos = plainToInstance(CreatePlaylistDto, tfpList);
        const result = new playlistDto();
        result.playlistList = playlistsDtos;

        return result;
    }

    private saveFile(file: Express.Multer.File | undefined, folder: string): string | null {
        if (!file) return null;

        const uploadDir = `/app/uploads/${folder}`;
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        const uniqueName = uuidv4();
        const ext = extname(file.originalname);

        const newFilename = `${Date.now()}-${uniqueName}${ext}`;
        const filePath = `${uploadDir}/${newFilename}`;

        if (file.path) {
            renameSync(file.path, filePath);
        }

        return newFilename;
    }
}
