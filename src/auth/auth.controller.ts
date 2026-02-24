import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService, RegistrationStatus, AuthResponse } from './auth.service';
import { CreateUserDto, LoginDto } from '../dto/users.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiCreatedResponse({
    description: 'Usuário registrado com sucesso',
    type: CreateUserDto,
  })
  @Post('register')
  public async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<RegistrationStatus> {
    const result: RegistrationStatus =
      await this.authService.register(createUserDto);
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @ApiOperation({ summary: 'Login do usuário' })
  @ApiOkResponse({ description: 'Token JWT e dados do usuário', type: Object })
  @Post('login')
  public async login(@Body() loginUserDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginUserDto);
  }
}
