import {
  Body,
  Controller,
  Get,
  Put,
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
import { UpdatePasswordDto, UserResponseDto } from '../dto/users.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados do usuário autenticado' })
  @ApiOkResponse({ type: UserResponseDto })
  @Get('me')
  public async me(@Request() req): Promise<UserResponseDto> {
    // req.user vem do JwtStrategy.validate
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar senha do usuário autenticado' })
  @ApiOkResponse({ description: 'Senha atualizada com sucesso' })
  @Put('password')
  public async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(updatePasswordDto, req.user.id);
  }
}
