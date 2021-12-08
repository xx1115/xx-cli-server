import { CommandDTO } from '@/models/command.dto';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandService } from './service';

@Controller('command')
export class CommandController {
  constructor(private readonly commandService: CommandService) {}

  @Get()
  @ApiOperation({ summary: '获取三方注册的command命令' })
  @ApiResponse({ status: 200, type: CommandDTO, isArray: true })
  getProject() {
    return this.commandService.findAll();
  }
}
