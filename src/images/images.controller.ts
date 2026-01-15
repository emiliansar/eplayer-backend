import { BadRequestException, Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { ImagesService } from './images.service';
import { join } from 'path';
import { Response } from 'express';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get(':preview')
  getImage(
    @Param('preview') preview: string,
    @Res() res: Response
  ) {
    try {
      const file = join('/app/uploads/images/', preview);
      return res.sendFile(file);
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException('Такого изображения несущестует');
      }
      throw error;
    }
  }
}
