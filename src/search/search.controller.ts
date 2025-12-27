import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('')
  async getResults(
    @Query('text') text: string
  ) {

    if (!text) {
      return {
        results: [],
        total: 0
      }
    }

    const { results, total } = await this.searchService.getResults(text);

    return {
      results,
      total,
      text
    }
  }
}
