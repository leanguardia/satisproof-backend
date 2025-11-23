import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { AttendanceController } from './attendance.controller';
import { EventsService } from './events.service';

@Module({
  controllers: [EventsController, AttendanceController],
  providers: [EventsService],
})
export class EventsModule {}
