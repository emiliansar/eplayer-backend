import { Injectable } from '@nestjs/common';
import { contains } from 'class-validator';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SearchService {
    constructor(
        private prisma: PrismaService
    ) {}

    async getResults(
        text: string,
        limit: number = 10
    ) {
        const words = this.prepareSearchWords(text);

        if (words.length === 0) {
            return {
                results: [],
                total: 0
            }
        }

        const results = await this.prisma.music.findMany({
            where: this.buildWhereCondition(text, words),
            include: {
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        const total = await this.prisma.music.count({
            where: this.buildWhereCondition(text, words)
        });

        const sortedResults = this.sortByRelevance(results, words, text);

        return {
            results: sortedResults,
            total
        };
    }

    private prepareSearchWords(searchQuery: string): string[] {
        return searchQuery
            .split('+')
            .filter(word => word.length > 0)
            .map(word => word.trim().toLowerCase());
    }

    private buildWhereCondition(searchQuery: string, words: string[]) {
        const conditions: any[] = [];

        conditions.push(
            {
                title: {
                    contains: searchQuery,
                    mode: 'insensitive'
                }
            },
            {
                description: {
                    contains: searchQuery,
                    mode: 'insensitive'
                }
            }
        );

        words.forEach(word => {
            conditions.push(
                {
                    title: {
                        contains: word,
                        mode: 'insensitive'
                    }
                },
                {
                    description: {
                        contains: word,
                        mode: 'insensitive'
                    }
                }
            )
        });

        return {
            OR: conditions
        };
    }

    private sortByRelevance(
        musics: any[],
        words: string[],
        fullQuery: string
    ): any[] {
        return musics
            .map(music => {
                let relevance = 0;
                const title = music.title.toLowerCase();
                const description = music.description?.toLowerCase() || '';
                const fullQueryLower = fullQuery.toLowerCase();

                if (title.includes(fullQueryLower)) relevance += 10;
                if (title.startsWith(fullQueryLower)) relevance += 5;

                if (description.includes(fullQueryLower)) relevance += 3;

                words.forEach(word => {
                    if (title.includes(word)) relevance += 2;
                    if (description.includes(word)) relevance += 1;
                })

                return {
                    ...music,
                    relevance
                };
            })
            .sort((a, b) => b.relevance - a.relevance);
    }
}


// const results = await this.prisma.$queryRaw`
        // SELECT
        //     music.*,
        //     (
        //         (LENGTH(music.title) - LENGTH(REPLACE(LOWER(music.title), LOWER(${text}), ''))
        //     ) / LENGTH(${text}) * 10 +
        //     COALESCE((LENGTH(music.description) - LENGTH(REPLACE(LOWER(music.description),
        //     LOWER(${text}), ''))) / LENGTH(${text}), 0) * 3 +
        //     CASE WHEN LOWER(music.title) LIKE LOWER(${text + '%'}) THEN 5 ELSE 0 END
        //     ) as relevance
        //     FROM "Music" music
        //     WHERE
        //         LOWER(music.title) LIKE LOWER (${'%' + text + '%'}) OR
        //         LOWER(music.description) LIKE LOWER(${'%' + text + '%'}) OR
        //         ${this.buildWordsCondition(words)}
        //     ORDER BY relevance DESC, music.id DESC
        //     LIMIT ${limit}
        // `;

        // const total = await this.prisma.music.count({
        //     where: this.buildWordsCondition(text, words),
        // });

        // return {
        //     results,
        //     total
        // };

// private buildWordsCondition(words: string[]): string {
    //     if (words.length === 0) return 'FALSE';

    //     const conditions = words.map(word =>
    //         `LOWER(m.title) LIKE LOWER('%${word}%') OR LOWER(m.description) LIKE LOWER('%${word}%')`
    //     );

    //     return conditions.join('OR');
    // }

    // private buildWhereCondition(searchQuery: string, words: string[]) {
    //     return {
    //         OR: [
    //             {
    //                 title: {
    //                     contains: searchQuery,
    //                     mode: 'insensitive'
    //                 },
    //             },
    //             {
    //                 description: {
    //                     contains: searchQuery,
    //                     mode: 'insensitive'
    //                 }
    //             },
    //             ...words.map(word => ({
    //                 OR: [
    //                     {
    //                         title: {
    //                             contains: word,
    //                             mode: 'insensitive'
    //                         },
    //                     },
    //                     {
    //                         description: {
    //                             contains: word,
    //                             mode: 'insensitive'
    //                         }
    //                     },
    //                 ]
    //             })),
    //         ]
    //     }
    // }