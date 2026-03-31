import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtCustomService } from '../jwt/jwt-custom.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtCustomService,
  ) {}

  async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token ausente');
    }

    try {
      const payload = await this.jwtService.verifyToken(refreshToken);
      const jti = payload.jti;
      const userId = payload.sub;

      if (!jti || !userId) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { jti },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      if (storedToken.revokedAt) {
        throw new UnauthorizedException('Refresh token revogado');
      }

      if (storedToken.expiresAt < new Date()) {
        await this.revokeToken(jti);
        throw new UnauthorizedException('Refresh token expirado');
      }

      const isValid = await bcrypt.compare(refreshToken, storedToken.tokenHash);
      if (!isValid) {
        await this.revokeToken(jti);
        throw new UnauthorizedException('Refresh token inválido');
      }

      await this.revokeToken(jti);

      return this.generateNewTokens(userId, storedToken.user.email, storedToken.user.nome);
    } catch (error) {
      throw new UnauthorizedException('Falha ao renovar sessão');
    }
  }

  async verifyRefreshTokenOnly(refreshToken: string) {
    return this.jwtService.verifyToken(refreshToken);
  }

  private async generateNewTokens(userId: string, email: string, nome?: string) {
    const { token: accessToken, jti: accessJti } =
      await this.jwtService.generateAccessToken(userId, email);
    const { token: newRefreshToken, jti: refreshJti, expiresAt } =
      await this.jwtService.generateRefreshToken(userId);

    const tokenHash = await bcrypt.hash(newRefreshToken, 10);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        jti: refreshJti,
        expiresAt,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { jti: accessJti },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: { id: userId, email, nome },
    };
  }

  async revokeToken(jti: string) {
    await this.prisma.refreshToken.updateMany({
      where: { jti, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  async cleanupExpiredTokens() {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    return result.count;
  }
}
