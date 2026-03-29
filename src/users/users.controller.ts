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
  UpdatePasswordDto,
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
  public async me(@Request() req: any): Promise<UserResponseDto> {
    // req.user vem do JwtStrategy.validate
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  public async getById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar senha do usuário autenticado' })
  @ApiOkResponse({ description: 'Senha atualizada com sucesso' })
  @Put('password')
  public async updatePassword(
    @Request() req: any,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(updatePasswordDto, req.user.id);
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/password')
  public async updatePasswordById(
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(dto, id);
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
