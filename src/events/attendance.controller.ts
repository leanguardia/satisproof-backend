import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { RegisterAttendanceDto } from './dto/register-attendance.dto';
import { ApiKeyGuard } from '../auth/api-key.guard';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('register')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Register user attendance to an event' })
  @ApiResponse({
    status: 200,
    description: 'Attendance registered successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid API key',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Missing event ID or user address',
  })
  register(@Body() registerAttendanceDto: RegisterAttendanceDto) {
    return this.eventsService.registerAttendance(registerAttendanceDto);
  }
}
