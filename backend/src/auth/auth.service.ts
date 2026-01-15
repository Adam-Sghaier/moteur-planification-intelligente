import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Simple utilisateur en mémoire pour la démo - en production, utiliser une vraie base de données
const DEMO_USER = {
  id: '1',
  email: 'admin@example.com',
  password: 'admin123', // En production, hasher avec bcrypt
  name: 'Admin',
};

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) { }

  async login(email: string, password: string): Promise<{ access_token: string }> {
    // Validation simple pour la démonstration
    if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload = { sub: DEMO_USER.id, email: DEMO_USER.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateToken(payload: any): Promise<any> {
    if (payload.email === DEMO_USER.email) {
      return { id: DEMO_USER.id, email: DEMO_USER.email, name: DEMO_USER.name };
    }
    return null;
  }
}
