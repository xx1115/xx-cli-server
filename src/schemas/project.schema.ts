import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema()
export class Project {
  @Prop()
  @ApiProperty({ example: 'react ts 模板', description: '模板的基础信息' })
  readonly name: string;

  @Prop()
  @ApiProperty({ example: 'xx-create-react-ts', description: 'npm包的name' })
  readonly npmName: string;

  @Prop()
  @ApiPropertyOptional({ example: 'latest', description: 'npm包的版本' })
  readonly version?: string;

  @Prop()
  @ApiPropertyOptional({
    example: 'npm install',
    description: '项目的安装命令，如果需要脚手架自动执行安装，可以配置该字段',
  })
  installCommand?: string;

  @Prop()
  @ApiPropertyOptional({
    example: 'npm start',
    description: '项目的启动命令，如果需要脚手架自动启动，可以配置该字段',
  })
  startCommand?: string;

  @Prop()
  @ApiPropertyOptional({
    example: ['project'],
    description: 'tag信息，用于搜索',
  })
  tag?: string[];

  @Prop()
  @ApiPropertyOptional({
    example: ['public/**'],
    description: '模板渲染时忽略的文件',
  })
  ignore?: string[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
