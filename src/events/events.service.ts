import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { RegisterAttendanceDto } from './dto/register-attendance.dto';

@Injectable()
export class EventsService {
  private events: any[] = [];
  private attendances: any[] = [];

  create(createEventDto: CreateEventDto) {
    const generatedEventId = Date.now().toString();
    
    return {
      generatedEventId,
    };
  }

  findAll() {
    return this.events;
  }

  registerAttendance(registerAttendanceDto: RegisterAttendanceDto) {
    const { eventId, userAddress } = registerAttendanceDto;
    
    // Verificar que ambos campos están presentes
    if (!eventId || !userAddress) {
      throw new NotFoundException('Event ID and user address are required');
    }

    // Registrar la asistencia
    const attendance = {
      eventId,
      userAddress,
      timestamp: new Date().toISOString(),
    };
    
    this.attendances.push(attendance);
    
    return {
      message: 'Attendance registered successfully',
      attendance,
    };
  }
}
