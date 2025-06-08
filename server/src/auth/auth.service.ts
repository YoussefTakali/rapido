import { 
  Injectable, 
  ConflictException, 
  UnauthorizedException,
  BadRequestException,
  Logger,
  InternalServerErrorException 
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { JwtService } from '@nestjs/jwt';
import { NotificationType, Role } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private notificationService: NotificationService,

  ) {
    this.saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
  }

async register(dto: RegisterDto): Promise<RegisterResponseDto> {
  try {
    // Check if user already exists
    await this.checkUserExists(dto.email);

    // Hash password with configurable salt rounds
    const hashedPassword = await this.hashPassword(dto.password);
    console.log(`Hashed password for ${dto.email}: ${hashedPassword}`);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        password: hashedPassword,
        role: Role.EMPLOYEE,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    console.log(`User created: ${JSON.stringify(user)}`);
    this.logger.log(`User registered successfully: ${user.email}`);

    // Find all admins
    const adminUsers = await this.prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: { id: true },
    });
    // Send notification to each admin
    for (const admin of adminUsers) {
      await this.notificationService.createNotification(
        admin.id,
        `New user registered: ${user.email}`,
        NotificationType.UserRegister,
        user.id
      );
    }

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    if (error instanceof ConflictException) {
      throw error;
    }

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
    }

    this.logger.error(`Registration failed for ${dto.email}:`, error);
    throw new InternalServerErrorException('Registration failed');
  }
}


  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const user = await this.validateUserCredentials(loginDto);
      
      if (!user) {
        // Add delay to prevent timing attacks
        await this.addSecurityDelay();
        throw new UnauthorizedException('Invalid credentials');
      }
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isOnline: true,
        lastSeen: new Date(), // Optional here on login, mainly useful on logout/disconnect
      },
    });
      const tokens = await this.generateTokens(user);
      
      this.logger.log(`User logged in successfully: ${user.email}`);
      // Return access and refresh tokens along with user info      
      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture , // Optional field
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`Login failed for ${loginDto.email}:`, error);
      throw new InternalServerErrorException('Login failed');
    }
  }

async refreshToken(refreshTokenDto: RefreshTokenDto) {
  // Verify using dedicated refresh token method
  const payload = this.verifyRefreshToken(refreshTokenDto.refresh_token);
  
  // No user check - already validated in token verification
  return { 
    access_token: await this.generateAccessToken(payload.sub) 
  };
}

  decodeToken(token: string): any {
    try {
      return this.jwtService.decode(token);
    } catch (error) {
      this.logger.error('Token decode failed:', error);
      throw new BadRequestException('Invalid token format');
    }
  }

  private async checkUserExists(email: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      this.logger.error('Password hashing failed:', error);
      throw new InternalServerErrorException('Password processing failed');
    }
  }

  private async validateUserCredentials(loginDto: LoginDto): Promise<any> {
    const user = await this.prisma.user.findUnique({ 
      where: { email: loginDto.email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        profilePicture: true, // Optional field
      },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Remove password from return object
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      type: 'access'
    };

    const refreshPayload = { 
      sub: user.id, 
      type: 'refresh'
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '9h'),
      }),
      this.jwtService.signAsync(refreshPayload, {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '9h'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private generateAccessToken(payload: any): string {
    return this.jwtService.sign(
      { ...payload, type: 'access' },
      {
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '9h'),
      }
    );
  }

  private verifyRefreshToken(token: string): any {
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async addSecurityDelay(): Promise<void> {
    // Add small random delay to prevent timing attacks
    const delay = Math.floor(Math.random() * 100) + 50;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  async logout(userId: number): Promise<{ message: string }> {
  try {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: false,
        lastSeen: new Date(),
      },
    });

    this.logger.log(`User logged out successfully: ID ${userId}`);
    return { message: 'Logout successful' };
  } catch (error) {
    this.logger.error(`Logout failed for user ID ${userId}:`, error);
    throw new InternalServerErrorException('Logout failed');
  }
}

}