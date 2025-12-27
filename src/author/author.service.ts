import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Music } from 'prisma/generated';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthorService {
    constructor(private prisma: PrismaService) {}

    async getAuthor(authorId: number) {
        if (isNaN(authorId) || !authorId) throw new BadRequestException("Идентификатор автора неверный")

        const author = await this.prisma.user.findUnique({
            where :{
                id: +authorId
            }
        });
        if (!author) throw new NotFoundException("Такого автора не существует");

        return author;
    }

    async getMusic(authorId: number) {
        if (isNaN(authorId)|| !authorId) throw new BadRequestException("Идентификатор автора неверный");

        const author = this.prisma.user.findUnique({
            where: {
                id: +authorId
            }
        });

        if (!author) {
            throw new BadRequestException("Такого автора не существует");
        }

        const music = await this.prisma.music.findMany({
            where: {
                authorId: +authorId
            }
        })

        if (music.length === 0) throw new NotFoundException("Нету произведений");

        console.log("getMusic: ", music)
        return music;
    }

    async getPls(authorId: number) {
        if (isNaN(authorId)|| !authorId) throw new BadRequestException("Идентификатор автора неверный");

        const author = this.prisma.user.findUnique({
            where: {
                id: +authorId,
            }
        });

        if (!author) {
            throw new BadRequestException("Такого автора не существует");
        }

        const pls = await this.prisma.playlist.findMany({
            where: {
                authorId: +authorId,
                access: true
            }
        })

        if (pls.length === 0) throw new NotFoundException("Нету произведений");

        console.log("getPls: ", pls)
        return pls;
    }
}
