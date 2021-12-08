import { Injectable } from '@nestjs/common';
import { Project, ProjectDocument } from '@/schemas/project.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateProjectDto } from '@/models/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectModel.find().exec();
  }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const createdCat = new this.projectModel(createProjectDto);
    return createdCat.save();
  }
}
