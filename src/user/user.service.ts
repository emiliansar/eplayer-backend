import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePlaylistDto, UpdatePlayListDto } from './dto/playlist.dto';
import { UserDto } from 'src/auth/dto/user.dto';
import { UserUpdateDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async getAll() {
        return await this.prisma.user.findMany()
    }

    async patchAcc(userId: number, dto: UserUpdateDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) throw new NotFoundException("Такого пользователя не существует");

        return await this.prisma.user.update({
            where: {
                id: userId
            }, data: {
                ...user,
                name: dto.name,
                description: dto.description,
            }
        });
    }

    async profile(userSub: number) {
        if (!userSub) throw new BadRequestException("Не передан идентификатор пользователя");

        const user = await this.prisma.user.findUnique({
            where: {
                id: userSub
            },
            include: {
                music: true,
                history: true,
                playlists: true
            }
        });
        if (!user) throw new NotFoundException("Так пользователь не найден");

        return user;
    }

    async createPlayList(authorId: number, dto: CreatePlaylistDto) {
        // if (!authorId || !dto.name || !dto.access) throw new BadRequestException("Укажите все нужные параметры");
        if (!authorId) throw new BadRequestException("Укажите все нужные параметры: authorId");
        if (!dto.name) throw new BadRequestException("Укажите все нужные параметры: dto.name");
        // if (!dto.access) throw new BadRequestException("Укажите все нужные параметры: dto.access");

        const playlist = await this.prisma.playlist.create({
            data: {
                name: dto.name,
                authorId,
                access: dto.access,
                description: dto.description || null
            }
        });

        if (!playlist) throw new InternalServerErrorException("Не удалось создать плейлист");
        if (!dto.newItem) return playlist;

        const updatePlayList: UpdatePlayListDto = {
            userId: authorId,
            id: playlist.id,
            name: playlist.name,
            description: playlist.description || '',
            access: playlist.access,
            newItem: dto.newItem,
        }

        return this.updatePlaylist(authorId, updatePlayList);
    }

    async updatePlaylist(authorId: number, dto: UpdatePlayListDto) {
        if (!authorId) throw new BadRequestException("Автор не указан");
        if (!dto.id) throw new BadRequestException("Не указан плейлист");

        // const playlists = await this.prisma.playlist.findMany({
        //     where: {
        //         authorId: authorId
        //     }
        // });
        // // if (!playlists) throw new NotFoundException("У вас нет плейлистов");

        // const isOwnedBy = playlists.filter(list => list.id === dto.id);
        // if (isOwnedBy.length) throw new Error("Это не ваш плейлист");

        // // return console.log(isOwnedBy);

        const playlist = await this.prisma.playlist.findUnique({
            where: {
                id: dto.id,
                authorId,
            }
        });
        if (!playlist) throw new ForbiddenException("На вашем аккаунте не зарегистрирован данный плейлист");

        const same = playlist?.musicList.filter(item => item === dto.newItem);
        if (same.length > 0) {throw new ConflictException("Данное произведение уже добавлено в плейлист");}

        if (!dto.newItem) {
            console.log("Без newItem: ", dto);
            return await this.prisma.playlist.update({
                where: {
                    id: dto.id
                },
                data: {
                    name: dto.name,
                    description: dto.description,
                    access: dto.access,
                }
            });
        } else if (dto.newItem) {
            // const sameItem = playlist.musicList.filter(item => item === dto.newItem)
            // if (sameItem.length > 0) {
            //     throw new InternalServerErrorException("Данное произведение уже существует в плейлисте")
            // }
            console.log("Вместе с newItem: ", dto);
            return await this.prisma.playlist.update({
                where: {
                    id: dto.id
                },
                data: {
                    name: dto.name,
                    description: dto.description,
                    access: dto.access,
                    musicList: {
                        push: dto.newItem
                    }
                }
            });
        }

        return true;
    }

    async getPlaylists() {
        return await this.prisma.playlist.findMany({
            where: {
                access: true,
            }
        });
    }

    async getUserPlaylists(userId: number) {
        return await this.prisma.playlist.findMany({
            where: {
                authorId: userId
            }
        });
    }

    async addSubscription(userId: number, authorId: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: +userId
            }
        });
        if (!user) throw new NotFoundException("Такого пользователя не существует")

        const author = await this.prisma.user.findUnique({
            where: {
                id: +authorId
            }
        });
        if (!author) throw new NotFoundException("Такого автора не существует")

        return await this.prisma.user.update({
            where: {
                id: +userId
            },
            data: {
                subscriptions: {
                    set: [...new Set([...user.subscriptions, +authorId])]
                }
            }
        })
    }

    async getSubscription(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: +userId
            }
        });
        if (!user) throw new NotFoundException("Такого пользователя не существует");

        return user.subscriptions
    }
}
