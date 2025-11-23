import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  private events: any[] = [];

  create(createEventDto: CreateEventDto) {
    const generatedEventId = Date.now().toString();
    
    return {
      generatedEventId,
    };
  }

  findAll() {
    return this.events;
  }
}
