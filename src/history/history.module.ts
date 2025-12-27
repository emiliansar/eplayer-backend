import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [HistoryService, PrismaService],
  exports: [HistoryService]
})
export class HistoryModule {}
