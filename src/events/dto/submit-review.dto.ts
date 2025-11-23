import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class ReviewItemDto {
  @ApiProperty({
    description: 'Review question',
    example: '¿Cómo calificarías el evento?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'Rating from 1 to 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}

export class SubmitReviewDto {
  @ApiProperty({
    description: 'Event ID',
    example: '1732358400000',
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({
    description: 'User wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  })
  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @ApiProperty({
    description: 'Array of review questions and ratings',
    type: [ReviewItemDto],
    example: [
      {
        question: '¿Cómo calificarías el evento?',
        rating: 5,
      },
      {
        question: '¿Recomendarías este evento?',
        rating: 4,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewItemDto)
  reviews: ReviewItemDto[];
}
