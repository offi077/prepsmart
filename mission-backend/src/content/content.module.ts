import { Module } from '@nestjs/common';
import { CurrentAffairsController, DownloadsController } from './content.controller.js';
import { CurrentAffairsService, DownloadsService } from './content.service.js';

@Module({
    controllers: [CurrentAffairsController, DownloadsController],
    providers: [CurrentAffairsService, DownloadsService],
    exports: [CurrentAffairsService, DownloadsService],
})
export class ContentModule { }
