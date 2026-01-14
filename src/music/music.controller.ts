import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Query, Request, Res, StreamableFile, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { MusicService } from './music.service';
import { AuthGuard } from 'src/auth/guards/jwt.guard';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { multerOptions } from './multer-config';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { MusicDto } from './dto/music.dto';
import { createReadStream, existsSync } from 'fs';
import { getFileDto } from './dto/getFile.dto';
import { HistoryService } from 'src/history/history.service';
import { subListDto } from './dto/subList.dto';

@Controller('music')
export class MusicController {
  constructor(
    private readonly musicService: MusicService,
    private historyService: HistoryService
  ) {}

  @Get('meta-data/:musicId')
  async getMetaData(
    @Param('musicId') musicId: string
  ) {
    console.log("musicId пришёл на сервер: ", musicId, ": ", typeof(musicId))
    return this.musicService.getMetaData(musicId)
  }

  @Get('playlist-data/:playlistId')
  async getPlaylistData(
    @Param('playlistId') playlistId: string
  ) {
    return this.musicService.getPlaylistData(playlistId);
  }

  @Get('preview/:preview')
  async getPreview(
    @Param('preview') preview: string,
    @Res() res: Response
  ) {
    console.log("previewPath: ", JSON.stringify(preview));
    try {
      const file = join(process.cwd(), 'uploads/images/', preview);
      return res.sendFile(file);
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException('Такого изображения несущестует');
      }
      throw error;
    }
  }

  @Get(':path')
  async getAudio(
    @Param('path') path: string,
    @Res() res: Response,
    @Query('id') userId: number
  ) {
    console.log("audioPath: ", path);
    console.log("userId: ", userId);

    if (!path || path === undefined) {
      throw new NotFoundException("Путь к файлу не указан");
    }

    await this.historyService.addHistory(userId, path)

    // const uploadsPath = process.env.UPLOADS_PATH || './uploads';
    // const file = join(uploadsPath, 'music/', path);

    // if (!existsSync(file)) {
    //   throw new NotFoundException("Произведение не найдено");
    // }

    const file = `/app/uploads/music/${path}`;
    console.log("Trying file:", file);
    
    if (!existsSync(file)) {
      // Пробуем альтернативный путь
      const file2 = `/data/uploads/music/${path}`;
      console.log("Trying alternative:", file2);
      
      if (!existsSync(file2)) {
        throw new NotFoundException("Произведение не найдено");
      }
      
      return res.sendFile(file2);
    }

    return res.sendFile(file);
  }

  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'preview', maxCount: 1 },
        { name: 'audio', maxCount: 1 }
      ],
      multerOptions
    )
  )
  async uploadFile(
    @UploadedFiles() files: {
      preview?: Express.Multer.File[],
      audio: Express.Multer.File[]
    },
    @Body() dto: MusicDto
  ) {
      return this.musicService.uploadFile(files, dto);
  }

  @Get('download/:path')
  async getFile(
    @Param('path') path: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const file = createReadStream(join(process.cwd(), 'uploads/music/', path));

    res.set({
      'Content-Type': 'application/octet-stream',
      'content-Disposition': `attachment; path=${path}`,
    });

    return new StreamableFile(file);
  }

  @UseGuards(AuthGuard)
  @Delete('delete/:id')
  async deleteFile(
    @Param('id') id: number,
    @Request() req
  ) {
    return this.musicService.deleteFile(req.user.sub, id)
  }

  @UseGuards(AuthGuard)
  @Post('get-aos')
  async getAos(
    @Body() subList: subListDto,
    @Request() req
  ) {
    return this.musicService.getAos(req.user.sub, subList)
  }

  @UseGuards(AuthGuard)
  @Post('get-pos')
  async getPos(
    @Body() subList: subListDto,
    @Request() req
  ) {
    return this.musicService.getPos(req.user.sub, subList)
  }

  @Post('get-from-a')
  async getTakeFromA(
    @Body() dto: {
      takeFrom: number,
      target: number
    },
  ) {
    return this.musicService.getTakeFromA(dto)
  }

  @Post('get-from-p')
  async getTakeFromP(
    @Body() dto: { takeFrom: number },
  ) {
    return this.musicService.getTakeFromP(dto)
  }
}
