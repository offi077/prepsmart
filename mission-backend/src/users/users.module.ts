import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService], // export so other modules can inject it if needed
})
export class UsersModule { }
