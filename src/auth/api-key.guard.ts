import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  // Simple API key - in production, this should be in environment variables
  private readonly API_KEY = 'satisproof-api-key-2025';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey || apiKey !== this.API_KEY) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
