import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { RegisterAttendanceDto } from './dto/register-attendance.dto';
import { SubmitReviewDto } from './dto/submit-review.dto';

@Injectable()
export class EventsService {
  private events: any[] = [];
  private attendances: any[] = [];
  private reviews: any[] = [];

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

  submitReview(submitReviewDto: SubmitReviewDto) {
    const { eventId, userAddress, reviews } = submitReviewDto;
    
    // Guardar la review
    const review = {
      eventId,
      userAddress,
      reviews,
      timestamp: new Date().toISOString(),
    };
    
    this.reviews.push(review);
    
    return {
      message: 'Review submitted successfully',
      review,
    };
  }
}
