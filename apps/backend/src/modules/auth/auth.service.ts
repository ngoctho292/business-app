import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { db, users } from '../../db';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  UserDTO,
  AuthLoginResponse,
  TokenRefreshResponse,
} from '@t-business/shared-types';

@Injectable()
export class AuthService {
  private readonly accessTtl = 900; // 15 phút (900s)
  private readonly refreshTtl = 2592000; // 30 ngày (2592000s)

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Đăng nhập bằng email và mật khẩu
   */
  async login(email: string, pass: string): Promise<AuthLoginResponse> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const userDto: UserDTO = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    };

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessTtl,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.refreshTtl,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userDto,
    };
  }
  /**
   * Đăng ký tài khoản mới (tự đăng nhập sau khi đăng ký thành công)
   */
  async register(email: string, name: string, pass: string): Promise<AuthLoginResponse> {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      throw new ConflictException('Email này đã được sử dụng. Vui lòng chọn email khác.');
    }

    const passwordHash = await bcrypt.hash(String(pass), 12);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        password_hash: passwordHash,
        role: 'owner',
      })
      .returning();

    // Tự đăng nhập sau khi đăng ký
    return this.login(newUser.email, pass);
  }

  async refreshToken(refreshTokenStr: string): Promise<TokenRefreshResponse> {
    try {
      const decoded = this.jwtService.verify(refreshTokenStr);
      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.sub),
      });

      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(payload, {
        expiresIn: this.accessTtl,
      });

      const newRefreshToken = this.jwtService.sign(payload, {
        expiresIn: this.refreshTtl,
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Đăng xuất
   */
  async logout(userId: string): Promise<{ success: boolean }> {
    return { success: true };
  }
}
