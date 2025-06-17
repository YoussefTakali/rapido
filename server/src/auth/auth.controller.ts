import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

 @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('profilePicture', {
    storage: diskStorage({
      destination: './uploads/profile-pictures',
      filename: (req, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = extname(file.originalname);
        callback(null, `user-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<RegisterResponseDto> {
    return this.authService.register({ ...registerDto });
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }


  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req): Promise<{ message: string }> {
    // req.user should contain the decoded JWT payload with user ID
    const userId = req.user.sub;
    console.log(`Logging out user with ID: ${userId}`);
    return this.authService.logout(userId);
  }

  @Get('verify-token')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Request() req: any) {
    return {
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role, 
      },
    };
  }
  
}
