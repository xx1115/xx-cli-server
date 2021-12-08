import { CommandDocument, Command } from '@/schemas/command.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CommandService {
  constructor(
    @InjectModel(Command.name) private model: Model<CommandDocument>,
  ) {}

  async findAll(): Promise<Command[]> {
    return this.model.find().exec();
  }
}
