import { Injectable, Logger } from '@nestjs/common';

export interface UserTokens {
  userAddress: string;
  totalTokens: number;
  reviewTokens: number;
  attendanceTokens: number;
  eventCount: number;
  reviewCount: number;
  lastActivity: string;
  rank: string;
}

export interface LeaderboardEntry {
  rank: number;
  userAddress: string;
  totalTokens: number;
  eventCount: number;
  reviewCount: number;
}

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  
  // Almacenamiento en memoria de tokens por usuario
  private userTokensMap: Map<string, UserTokens> = new Map();
  
  // Configuración de tokens
  private readonly TOKEN_REWARDS = {
    REVIEW_SUBMISSION: 10,
    ATTENDANCE: 5,
    DETAILED_REVIEW: 15, // Bonus por reseñas detalladas (más de 3 preguntas)
    EARLY_BIRD: 5, // Bonus por ser de los primeros en revisar
  };

  private readonly RANK_THRESHOLDS = {
    NOVICE: 0,
    CONTRIBUTOR: 50,
    ACTIVE: 150,
    EXPERT: 300,
    CHAMPION: 500,
    LEGEND: 1000,
  };

  /**
   * Otorga tokens por enviar una reseña
   */
  grantReviewTokens(
    userAddress: string,
    eventId: string,
    reviewCount: number,
    isEarlyBird: boolean = false,
  ): number {
    const normalizedAddress = userAddress.toLowerCase();
    
    let tokensEarned = this.TOKEN_REWARDS.REVIEW_SUBMISSION;
    
    // Bonus por reseña detallada
    if (reviewCount >= 3) {
      tokensEarned += this.TOKEN_REWARDS.DETAILED_REVIEW;
    }
    
    // Bonus early bird
    if (isEarlyBird) {
      tokensEarned += this.TOKEN_REWARDS.EARLY_BIRD;
    }

    // Obtener o crear registro de usuario
    const userTokens = this.getUserTokens(normalizedAddress);
    
    userTokens.totalTokens += tokensEarned;
    userTokens.reviewTokens += tokensEarned;
    userTokens.reviewCount += 1;
    userTokens.lastActivity = new Date().toISOString();
    userTokens.rank = this.calculateRank(userTokens.totalTokens);
    
    this.userTokensMap.set(normalizedAddress, userTokens);
    
    this.logger.log(
      `Usuario ${normalizedAddress} ganó ${tokensEarned} tokens por reseña (Total: ${userTokens.totalTokens})`,
    );
    
    return tokensEarned;
  }

  /**
   * Otorga tokens por asistencia a un evento
   */
  grantAttendanceTokens(userAddress: string, eventId: string): number {
    const normalizedAddress = userAddress.toLowerCase();
    const tokensEarned = this.TOKEN_REWARDS.ATTENDANCE;

    const userTokens = this.getUserTokens(normalizedAddress);
    
    userTokens.totalTokens += tokensEarned;
    userTokens.attendanceTokens += tokensEarned;
    userTokens.eventCount += 1;
    userTokens.lastActivity = new Date().toISOString();
    userTokens.rank = this.calculateRank(userTokens.totalTokens);
    
    this.userTokensMap.set(normalizedAddress, userTokens);
    
    this.logger.log(
      `Usuario ${normalizedAddress} ganó ${tokensEarned} tokens por asistencia`,
    );
    
    return tokensEarned;
  }

  /**
   * Obtiene los tokens de un usuario
   */
  getUserTokens(userAddress: string): UserTokens {
    const normalizedAddress = userAddress.toLowerCase();
    
    if (!this.userTokensMap.has(normalizedAddress)) {
      const newUser: UserTokens = {
        userAddress: normalizedAddress,
        totalTokens: 0,
        reviewTokens: 0,
        attendanceTokens: 0,
        eventCount: 0,
        reviewCount: 0,
        lastActivity: new Date().toISOString(),
        rank: 'NOVICE',
      };
      this.userTokensMap.set(normalizedAddress, newUser);
      return newUser;
    }
    
    return this.userTokensMap.get(normalizedAddress)!;
  }

  /**
   * Calcula el rango basado en tokens totales
   */
  private calculateRank(totalTokens: number): string {
    if (totalTokens >= this.RANK_THRESHOLDS.LEGEND) return 'LEGEND';
    if (totalTokens >= this.RANK_THRESHOLDS.CHAMPION) return 'CHAMPION';
    if (totalTokens >= this.RANK_THRESHOLDS.EXPERT) return 'EXPERT';
    if (totalTokens >= this.RANK_THRESHOLDS.ACTIVE) return 'ACTIVE';
    if (totalTokens >= this.RANK_THRESHOLDS.CONTRIBUTOR) return 'CONTRIBUTOR';
    return 'NOVICE';
  }

  /**
   * Obtiene la tabla de clasificación
   */
  getLeaderboard(limit: number = 10): LeaderboardEntry[] {
    const allUsers = Array.from(this.userTokensMap.values());
    
    // Ordenar por tokens totales (descendente)
    allUsers.sort((a, b) => b.totalTokens - a.totalTokens);
    
    // Tomar top N usuarios
    const topUsers = allUsers.slice(0, limit);
    
    // Mapear a formato de leaderboard
    return topUsers.map((user, index) => ({
      rank: index + 1,
      userAddress: user.userAddress,
      totalTokens: user.totalTokens,
      eventCount: user.eventCount,
      reviewCount: user.reviewCount,
    }));
  }

  /**
   * Obtiene las estadísticas generales del sistema de tokens
   */
  getSystemStats() {
    const totalUsers = this.userTokensMap.size;
    const allUsers = Array.from(this.userTokensMap.values());
    
    const totalTokensIssued = allUsers.reduce(
      (sum, user) => sum + user.totalTokens,
      0,
    );
    
    const totalReviews = allUsers.reduce(
      (sum, user) => sum + user.reviewCount,
      0,
    );
    
    const totalEvents = allUsers.reduce(
      (sum, user) => sum + user.eventCount,
      0,
    );
    
    // Distribución de rangos
    const rankDistribution = allUsers.reduce(
      (acc, user) => {
        acc[user.rank] = (acc[user.rank] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalUsers,
      totalTokensIssued,
      totalReviews,
      totalEvents,
      rankDistribution,
      averageTokensPerUser: totalUsers > 0 ? totalTokensIssued / totalUsers : 0,
    };
  }

  /**
   * Obtiene información de rangos
   */
  getRankInfo() {
    return {
      ranks: [
        { name: 'NOVICE', minTokens: this.RANK_THRESHOLDS.NOVICE },
        { name: 'CONTRIBUTOR', minTokens: this.RANK_THRESHOLDS.CONTRIBUTOR },
        { name: 'ACTIVE', minTokens: this.RANK_THRESHOLDS.ACTIVE },
        { name: 'EXPERT', minTokens: this.RANK_THRESHOLDS.EXPERT },
        { name: 'CHAMPION', minTokens: this.RANK_THRESHOLDS.CHAMPION },
        { name: 'LEGEND', minTokens: this.RANK_THRESHOLDS.LEGEND },
      ],
      rewards: this.TOKEN_REWARDS,
    };
  }
}
