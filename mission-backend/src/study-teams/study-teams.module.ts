import { Module } from '@nestjs/common';
import { StudyTeamsController } from './study-teams.controller.js';
import { StudyTeamsService } from './study-teams.service.js';

@Module({
    controllers: [StudyTeamsController],
    providers: [StudyTeamsService],
    exports: [StudyTeamsService],
})
export class StudyTeamsModule { }
