import { CreateProjectDto } from '@/models/project.dto';
import { ProjectService } from './service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: '获取三方注册的项目模板' })
  @ApiResponse({ status: 200, type: CreateProjectDto, isArray: true })
  getProject() {
    return this.projectService.findAll();
  }

  @Post()
  @ApiOperation({ summary: '创建项目模板' })
  @ApiResponse({ status: 200, type: CreateProjectDto })
  addProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }
}
