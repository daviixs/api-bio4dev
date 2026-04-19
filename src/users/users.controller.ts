import {
  Body,
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Param,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  UserResponseDto,
  UpdateUserDto,
  UpdatePreferencesDto,
} from '../dto/users.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados do usuário autenticado' })
  @ApiOkResponse({ type: UserResponseDto })
  @Get('me')
  public me(@Request() req: any): UserResponseDto {
    // req.user vem do JwtStrategy.validate
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  public async getById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  /**
   * @deprecated Password management is no longer supported with Google OAuth.
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deprecated - Password management not available with Google OAuth',
  })
  @Put('password')
  public updatePassword() {
    throw new BadRequestException(
      'Password management is not available with Google OAuth authentication.',
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  public async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/preferences')
  public async updatePreferences(
    @Param('id') id: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.usersService.updatePreferences(id, dto);
  }

  /**
   * @deprecated Password management is no longer supported with Google OAuth.
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deprecated - Password management not available with Google OAuth',
  })
  @Patch(':id/password')
  public updatePasswordById() {
    throw new BadRequestException(
      'Password management is not available with Google OAuth authentication.',
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/2fa/enable')
  public async enable2fa(@Param('id') id: string) {
    return this.usersService.enable2FA(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/2fa/disable')
  public async disable2fa(@Param('id') id: string) {
    return this.usersService.disable2FA(id);
  }
}
