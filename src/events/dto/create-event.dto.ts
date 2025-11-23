import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'Event title',
    example: 'ETH Global Hackathon',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Event description',
    example: 'A 48-hour blockchain development event',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Event image URL',
    example: 'https://example.com/event-image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({
    description: 'Event start date',
    example: '2025-12-01T09:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Event end date',
    example: '2025-12-03T18:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: 'Event location',
    example: 'Convention Center',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Token symbol',
    example: 'ETHG',
  })
  @IsString()
  @IsNotEmpty()
  tokenSymbol: string;

  @ApiProperty({
    description: 'Number of tokens per participant',
    example: 100,
  })
  @IsNumber()
  @Min(1)
  tokensPerParticipant: number;

  @ApiProperty({
    description: 'List of participants (wallet addresses or identifiers)',
    example: ['0x1234...', '0x5678...'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  participants?: string[];
}
