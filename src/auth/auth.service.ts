import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from './configs/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { AuthJwtPayload } from './types/auth-jwtPayloads';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        @Inject(refreshJwtConfig.KEY) private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>
    ) {}

    async register(dto: RegisterDto) {
        if (!dto.email || !dto.password) throw new UnauthorizedException("Отсутствует имя или пароль");

        const email = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (email) throw new UnauthorizedException("Пользователь с такой эл. почтой уже есть");
        
        let name = ''
        let address = '';

        if (dto.name) {
            name = dto.name
        } else if (!dto.name) {
            [name, address] = dto.email.split('@');
        }

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(dto.password, salt);

        return await this.prisma.user.create({
            data: {
                ...dto,
                name: name,
                password: hash
            }
        });
    }

    async signIn(dto: SignInDto): Promise<{
        id: number,
        access_token: string,
        refresh_token: string,
    }> {
        if (!dto.email || !dto.password) throw new UnauthorizedException("Отсутствует почта или пароль");

        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (!user) throw new UnauthorizedException("Пользователя с такой эл. почтой не существует");

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) throw new UnauthorizedException("Пароль не верный");

        const payload = { sub: user.id, email: user.email };
        const access_token = await this.jwtService.signAsync(payload);
        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: this.refreshTokenConfig.secret,
            expiresIn: this.refreshTokenConfig.signOptions?.expiresIn,
        });

        return {
            id: +user.id,
            access_token,
            refresh_token,
        }
    }

    refreshToken(userId: number) {
        const payload: AuthJwtPayload = { sub: userId };
        const token = this.jwtService.sign(payload);

        return {
            id: userId,
            token
        }
    }
}
