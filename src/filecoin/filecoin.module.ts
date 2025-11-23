import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilecoinStorageService } from './filecoin-storage.service';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [FilecoinStorageService, TokensService],
  controllers: [TokensController],
  exports: [FilecoinStorageService, TokensService],
})
export class FilecoinModule {}
