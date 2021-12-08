import { Controller, Get, Query } from '@nestjs/common';
import { EventService } from './service';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  getOssFiles(@Query() param: EventParam) {
    return this.eventService.getOssFiles(param);
  }

  @Get('/getOSSFile')
  getOssFile(@Query() ossFileParam: OssFileParam) {
    return this.eventService.getOssFileByPath(ossFileParam);
  }
}

export interface EventParam {
  production: string;
  projectName: string;
}

export interface OssFileParam {
  fileDir: string;
  production: string;
  filePath: string;
}
