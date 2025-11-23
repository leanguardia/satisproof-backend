import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AnonymousReview {
  eventId: string;
  reviewId: string;
  reviews: Array<{
    question: string;
    rating: number;
  }>;
  timestamp: string;
  userHash: string; // Hash anónimo del usuario
}

export interface ReviewStorageResult {
  pieceCid: string;
  size: number;
  reviewId: string;
  timestamp: string;
}

@Injectable()
export class FilecoinStorageService implements OnModuleInit {
  private readonly logger = new Logger(FilecoinStorageService.name);
  private synapse: any = null;
  private ethers: any = null;
  private RPC_URLS: any = null;
  private isInitialized = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      await this.initialize();
    } catch (error) {
      this.logger.warn(
        `Failed to initialize Filecoin storage: ${error.message}`,
      );
      this.logger.warn('Filecoin storage will be disabled');
    }
  }

  /**
   * Inicializa el Synapse SDK (carga dinámica para ESM)
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const privateKey = this.configService.get<string>('FILECOIN_PRIVATE_KEY');
    
    if (!privateKey) {
      throw new Error('FILECOIN_PRIVATE_KEY no configurada');
    }

    this.logger.log('Cargando Synapse SDK y Ethers...');

    try {
      // Importación dinámica de módulos ESM
      const [synapseModule, ethersModule] = await Promise.all([
        import('@filoz/synapse-sdk'),
        import('ethers'),
      ]);

      this.ethers = ethersModule;
      this.RPC_URLS = synapseModule.RPC_URLS;

      const rpcUrl =
        this.configService.get<string>('FILECOIN_RPC_URL') ||
        this.RPC_URLS.calibration.http;

      this.logger.log('Inicializando Synapse SDK para Filecoin...');

      this.synapse = await synapseModule.Synapse.create({
        privateKey,
        rpcURL: rpcUrl,
      });

      this.isInitialized = true;
      this.logger.log('✅ Synapse SDK inicializado correctamente');
    } catch (error) {
      this.logger.error(`Error al cargar módulos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Crea un hash anónimo del usuario
   */
  private createAnonymousHash(userAddress: string, eventId: string): string {
    const data = `${userAddress.toLowerCase()}-${eventId}-${Date.now()}`;
    return this.ethers.keccak256(this.ethers.toUtf8Bytes(data));
  }

  /**
   * Almacena una reseña de forma anónima en Filecoin
   */
  async storeAnonymousReview(
    eventId: string,
    userAddress: string,
    reviews: Array<{ question: string; rating: number }>,
  ): Promise<ReviewStorageResult> {
    if (!this.synapse || !this.isInitialized) {
      throw new Error('Filecoin storage no está inicializado');
    }

    const reviewId = `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    const userHash = this.createAnonymousHash(userAddress, eventId);

    const anonymousReview: AnonymousReview = {
      eventId,
      reviewId,
      reviews,
      timestamp,
      userHash,
    };

    const metadata = {
      type: 'anonymous_review',
      data: anonymousReview,
    };

    const jsonString = JSON.stringify(metadata, null, 2);
    const data = new TextEncoder().encode(jsonString);

    this.logger.log(
      `Almacenando reseña anónima para evento ${eventId} (${data.length} bytes)`,
    );

    try {
      const uploadResult = await this.synapse.storage.upload(data);
      const pieceCid = uploadResult.pieceCid.toString();

      this.logger.log(`✅ Reseña almacenada en Filecoin - CID: ${pieceCid}`);

      return {
        pieceCid,
        size: uploadResult.size,
        reviewId,
        timestamp,
      };
    } catch (error) {
      this.logger.error(`Error al almacenar reseña: ${error.message}`);
      throw error;
    }
  }

  /**
   * Almacena estadísticas agregadas de un evento
   */
  async storeEventStatistics(
    eventId: string,
    statistics: {
      totalReviews: number;
      averageRatings: Record<string, number>;
      overallRating: number;
    },
  ): Promise<{ pieceCid: string; size: number }> {
    if (!this.synapse || !this.isInitialized) {
      throw new Error('Filecoin storage no está inicializado');
    }

    const metadata = {
      type: 'event_statistics',
      eventId,
      timestamp: new Date().toISOString(),
      data: statistics,
    };

    const jsonString = JSON.stringify(metadata, null, 2);
    const data = new TextEncoder().encode(jsonString);

    this.logger.log(`Almacenando estadísticas para evento ${eventId}`);

    try {
      const uploadResult = await this.synapse.storage.upload(data);
      const pieceCid = uploadResult.pieceCid.toString();

      this.logger.log(
        `✅ Estadísticas almacenadas en Filecoin - CID: ${pieceCid}`,
      );

      return {
        pieceCid,
        size: uploadResult.size,
      };
    } catch (error) {
      this.logger.error(`Error al almacenar estadísticas: ${error.message}`);
      throw error;
    }
  }

  /**
   * Descarga datos desde Filecoin
   */
  async download(pieceCid: string): Promise<any> {
    if (!this.synapse || !this.isInitialized) {
      throw new Error('Filecoin storage no está inicializado');
    }

    this.logger.log(`Descargando desde Filecoin - CID: ${pieceCid}`);

    try {
      const bytes = await this.synapse.storage.download(pieceCid);
      const jsonString = new TextDecoder().decode(bytes);
      const data = JSON.parse(jsonString);

      this.logger.log('✅ Descarga exitosa');
      return data;
    } catch (error) {
      this.logger.error(`Error al descargar: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verifica si el servicio está disponible
   */
  isAvailable(): boolean {
    return this.isInitialized && this.synapse !== null;
  }
}
