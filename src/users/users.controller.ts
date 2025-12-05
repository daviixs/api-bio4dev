import { Body, Controller, Post } from '@nestjs/common';
import { UserDto } from 'src/dto/users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}
    @Post()
    async create(@Body() data: UserDto) {
        return this.usersService.create(data);
    }
}