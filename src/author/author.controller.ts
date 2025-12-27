import { Controller, Get, Param } from '@nestjs/common';
import { AuthorService } from './author.service';

@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get(':authorId')
  getAuthor(
    @Param('authorId') authorId: number
  ) {
    return this.authorService.getAuthor(authorId)
  }

  @Get('music/:authorId')
  getMusic(
    @Param('authorId') authorId: number
  ) {
    return this.authorService.getMusic(authorId)
  }

  @Get('pls/:authorId')
  getPls(
    @Param('authorId') authorId: number
  ) {
    return this.authorService.getPls(authorId)
  }
}
