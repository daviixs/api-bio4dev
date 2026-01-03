import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserDto } from 'src/dto/users.dto';
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
    @Post()
    async create(@Body() data: UserDto) {
        return this.usersService.create(data);
    }
}
