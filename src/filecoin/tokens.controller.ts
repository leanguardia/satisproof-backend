import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TokensService } from './tokens.service';
import { ApiKeyGuard } from '../auth/api-key.guard';

@ApiTags('tokens')
@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get('user/:address')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Get user tokens and ranking information' })
  @ApiParam({
    name: 'address',
    description: 'User wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  })
  @ApiResponse({
    status: 200,
    description: 'User tokens retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid API key',
  })
  getUserTokens(@Param('address') address: string) {
    return this.tokensService.getUserTokens(address);
  }

  @Get('leaderboard')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Get tokens leaderboard' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of top users to return',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid API key',
  })
  getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return {
      leaderboard: this.tokensService.getLeaderboard(limitNum),
    };
  }

  @Get('stats')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Get system-wide token statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid API key',
  })
  getStats() {
    return this.tokensService.getSystemStats();
  }

  @Get('ranks')
  @ApiOperation({ summary: 'Get rank information and requirements' })
  @ApiResponse({
    status: 200,
    description: 'Rank information retrieved successfully',
  })
  getRanks() {
    return this.tokensService.getRankInfo();
  }
}
