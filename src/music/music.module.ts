import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { HistoryModule } from 'src/history/history.module';

@Module({
  imports: [HistoryModule],
  controllers: [MusicController],
  providers: [MusicService, PrismaService, JwtService, HistoryModule],
})
export class MusicModule {}
