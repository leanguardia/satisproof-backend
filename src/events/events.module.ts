import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { AttendanceController } from './attendance.controller';
import { ReviewsController } from './reviews.controller';
import { EventsService } from './events.service';

@Module({
  controllers: [EventsController, AttendanceController, ReviewsController],
  providers: [EventsService],
})
export class EventsModule {}
