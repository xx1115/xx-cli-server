import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type CommandDocument = Command & Document;

export class CommandOption {
  @ApiProperty({
    example: '-d, --debug',
    description: '可选参数名称',
  })
  flags: string;
  @ApiProperty({
    example: '是否开启debug模式打印日志信息',
    description: '可选描述',
  })
  description?: string;
  @ApiPropertyOptional({
    example: true,
    description: '默认值',
  })
  defaultValue?: string | boolean;
}

@Schema()
export class Command {
  @Prop()
  @ApiProperty({
    example: 'kill',
    description: '命令名称',
  })
  commandName: string;

  @Prop()
  @ApiPropertyOptional({
    type: CommandOption,
    isArray: true,
    description: 'command的配置参数',
  })
  options: CommandOption[];

  @Prop()
  @ApiProperty({ example: '@xx1115/cli', description: 'npm包的name' })
  packageName: string;

  @Prop()
  @ApiPropertyOptional({ example: '0.0.1', description: 'npm包的版本' })
  packageVersion: string;
}

export const CommandSchema = SchemaFactory.createForClass(Command);
