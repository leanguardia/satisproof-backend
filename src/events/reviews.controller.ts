import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { ApiKeyGuard } from '../auth/api-key.guard';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('submit')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Submit a review for an event' })
  @ApiResponse({
    status: 200,
    description: 'Review submitted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid API key',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data',
  })
  submit(@Body() submitReviewDto: SubmitReviewDto) {
    return this.eventsService.submitReview(submitReviewDto);
  }
}
