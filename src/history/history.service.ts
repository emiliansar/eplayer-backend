import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class HistoryService {
    constructor(private prisma: PrismaService) {}

    async isExisting(musicId: number, authorId: number): Promise<boolean> {
        const story = await this.prisma.history.findFirst({
            where: {
                musicId: +musicId,
                authorId: +authorId,
            }
        });

        const today = new Date().toISOString().split('T')[0];
        const dateStory = story?.listenAt.toISOString().split('T')[0];

        if (today === dateStory) {
            return true;
        }

        return false;
    }

    async addHistory(userId: number, path: string) {
        if (!userId
            || userId === 0
            || isNaN(userId)
        ) {
            console.log("userId не корректный: ", userId)
            return null;
        }

        if (!path) {
            console.log("path не корректный: ", path)
            return null;
        }

        const music = await this.prisma.music.findFirst({
            where: {
                path
            }
        });

        if (!music?.id) {
            console.log("music не найден: ", music)
            return null;
        }

        if (await this.isExisting(music.id, userId)) {
            return null;
        }

        // return await this.prisma.history.create({
        //     data: {
        //         authorId: +userId,
        //         musicId: music.id,
        //     }
        // });

        const story = await this.prisma.history.create({
            data: {
                authorId: +userId,
                musicId: music.id
            }
        });

        return console.log("Запись истории создана: ", story);

        // return story;
    }

    async getHistory(userId: number) {
        if (!userId) throw new UnauthorizedException("Вы не авторизованны");

        console.log("Начался запрос истории")

        const history = await this.prisma.history.findMany({
            where: {
                authorId: userId,
            }
        });

        console.log("Запрос истории завершился: ", history)

        return history;
    }
}
