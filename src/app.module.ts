import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MusicModule } from './music/music.module';
import { HistoryModule } from './history/history.module';
import { UserModule } from './user/user.module';
import { AuthorModule } from './author/author.module';
import { ImagesModule } from './images/images.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    MusicModule,
    HistoryModule,
    UserModule,
    AuthorModule,
    ImagesModule,
    SearchModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
