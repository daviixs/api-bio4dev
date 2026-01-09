import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UserDto, LoginDto } from 'src/dto/users.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Criar usuario',
    description: 'Cria um novo usuario com email, senha e nome',
  })
  @ApiBody({ type: UserDto })
  @ApiCreatedResponse({ description: 'Usuario criado com sucesso' })
  @Post('register')
  async create(@Body() data: UserDto) {
    return this.usersService.create(data);
  }

  @ApiOperation({
    summary: 'Login de usuario',
    description: 'Autentica um usuario com email e senha',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Login realizado com sucesso' })
  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.usersService.login(data);
  }
}
