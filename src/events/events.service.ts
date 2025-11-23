import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { RegisterAttendanceDto } from './dto/register-attendance.dto';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { FilecoinStorageService } from '../filecoin/filecoin-storage.service';
import { TokensService } from '../filecoin/tokens.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private events: any[] = [];
  private attendances: any[] = [];
  private reviews: any[] = [];
  private eventReviewCounts: Map<string, number> = new Map();

  constructor(
    private readonly filecoinStorage: FilecoinStorageService,
    private readonly tokensService: TokensService,
  ) {}

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
    
    // Otorgar tokens por asistencia
    const tokensEarned = this.tokensService.grantAttendanceTokens(
      userAddress,
      eventId,
    );
    
    return {
      message: 'Attendance registered successfully',
      attendance,
      tokensEarned,
      userTokens: this.tokensService.getUserTokens(userAddress),
    };
  }

  async submitReview(submitReviewDto: SubmitReviewDto) {
    const { eventId, userAddress, reviews } = submitReviewDto;
    
    // Guardar la review localmente
    const review = {
      eventId,
      userAddress,
      reviews,
      timestamp: new Date().toISOString(),
    };
    
    this.reviews.push(review);
    
    // Determinar si es early bird (primeras 10 reseñas del evento)
    const currentReviewCount = this.eventReviewCounts.get(eventId) || 0;
    const isEarlyBird = currentReviewCount < 10;
    this.eventReviewCounts.set(eventId, currentReviewCount + 1);
    
    // Otorgar tokens por la reseña
    const tokensEarned = this.tokensService.grantReviewTokens(
      userAddress,
      eventId,
      reviews.length,
      isEarlyBird,
    );
    
    // Almacenar reseña de forma anónima en Filecoin
    let filecoinResult: { pieceCid: string; reviewId: string } | null = null;
    
    try {
      if (this.filecoinStorage.isAvailable()) {
        const result = await this.filecoinStorage.storeAnonymousReview(
          eventId,
          userAddress,
          reviews,
        );
        
        filecoinResult = {
          pieceCid: result.pieceCid,
          reviewId: result.reviewId,
        };
        
        this.logger.log(
          `Reseña almacenada en Filecoin - CID: ${result.pieceCid}`,
        );
      } else {
        this.logger.warn('Filecoin storage no disponible, reseña solo en local');
      }
    } catch (error) {
      this.logger.error(
        `Error al almacenar en Filecoin: ${error.message}`,
      );
      // Continuar sin Filecoin si falla
    }
    
    const response: any = {
      message: 'Review submitted successfully',
      review: {
        eventId,
        timestamp: review.timestamp,
        reviewCount: reviews.length,
      },
      tokensEarned,
      isEarlyBird,
      userTokens: this.tokensService.getUserTokens(userAddress),
    };
    
    if (filecoinResult) {
      response.filecoin = {
        stored: true,
        pieceCid: filecoinResult.pieceCid,
        reviewId: filecoinResult.reviewId,
      };
    }
    
    return response;
  }
}
