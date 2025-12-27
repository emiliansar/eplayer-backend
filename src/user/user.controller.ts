import { Body, Controller, Get, Param, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guards/jwt.guard';
import { CreatePlaylistDto, UpdatePlayListDto } from './dto/playlist.dto';
import { UserDto } from 'src/auth/dto/user.dto';
import { HistoryService } from 'src/history/history.service';
import { UserUpdateDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private historyService: HistoryService
  ) {}

  @UseGuards(AuthGuard)
  @Patch('patch-acc')
  patchAcc(@Request() req, @Body() dto: UserUpdateDto) {
    return this.userService.patchAcc(req.user.sub, dto)
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  profile(@Request() req) {
    return this.userService.profile(req.user.sub)
  }

  @UseGuards(AuthGuard)
  @Post('create-playlist')
  createPlaylist(
    @Request() req,
    @Body() dto: CreatePlaylistDto
  ) {
    console.log("В контроллер пришёл dto: ", dto)
    return this.userService.createPlayList(req.user.sub, dto)
  }

  @UseGuards(AuthGuard)
  @Post('update-playlist')
  updatePlaylist(
    @Request() req,
    @Body() dto: UpdatePlayListDto
  ) {
    return this.userService.updatePlaylist(req.user.sub, dto)
  }

  @Get('playlists')
  getPlaylists() {
    return this.userService.getPlaylists()
  }

  @UseGuards(AuthGuard)
  @Get('user-playlists')
  getUserPlaylists(
    @Request() req
  ) {
    return this.userService.getUserPlaylists(req.user.sub)
  }

  @UseGuards(AuthGuard)
  @Get('history')
  getHistory(@Request() req) {
    return this.historyService.getHistory(req.user.sub)
  }

  @UseGuards(AuthGuard)
  @Patch('add-sub/:authorId')
  addSubscription(
    @Param('authorId') authorId: string,
    @Request() req
  ) {
    return this.userService.addSubscription(req.user.sub, authorId)
  }

  @UseGuards(AuthGuard)
  @Get('get-subs')
  getSubscriptions(
    @Request() req
  ) {
    return this.userService.getSubscription(req.user.sub)
  }
}
