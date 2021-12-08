import { CloudBuildTask } from './task';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'ws';

const map = new Map<string, string>();

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;
  task: CloudBuildTask;

  @SubscribeMessage('connection')
  onConnection(@MessageBody() data: CloudBuildTaskDTO): WsResponse<any> {
    map.set(data.taskId, JSON.stringify(data));
    return { data: data.taskId, event: 'connection' };
  }

  @SubscribeMessage('build')
  async build(@ConnectedSocket() client: any, @MessageBody() taskId: string) {
    const options = JSON.parse(map.get(taskId));
    const task = new CloudBuildTask(options, client);
    this.task = task;
    try {
      await this.doTask(
        'prepare',
        '开始执行构建前准备工作',
        '构建前工作准备成功',
      );
      await this.doTask('downloadSource', '开始下载源码', '源码下载成功');
      await this.doTask('install', '开始执行依赖包安装', '依赖包安装成功');
      await this.doTask('build', '开始执行构建命令', '构建命令执行成功');
      await this.doTask(
        'preparePublish',
        '开始进行发布预检查',
        '发布预检查执行成功',
      );
      await this.doTask('publish', '开始进行发布动作', '发布成功');
    } catch (err) {
      task.logError(err.message);
      client.close();
    } finally {
      await this.doTask('clean', '开始清理缓存目录', '缓存目录清理成功', () => {
        map.delete(taskId);
        client.close();
      });
    }
  }

  async doTask(taskName, before: string, after: string, callback?: any) {
    const { logInfo, logSuccess } = this.task;
    const info = logInfo.bind(this.task);
    const success = logSuccess.bind(this.task);
    info(before);
    await this.task[taskName](callback);
    success(after);
  }
}

export interface CloudBuildTaskDTO {
  taskId: string;
  repo: string;
  name: string;
  branch: string;
  version: string;
  buildCmd: string;
  production?: boolean;
}
