import { WebsocketNotice } from './WebsocketNotice';
import { resolve } from 'path';
import { homedir } from 'os';
import {
  emptyDirSync,
  ensureDirSync,
  existsSync,
  pathExistsSync,
  removeSync,
} from 'fs-extra';
import simpleGit, { SimpleGit } from 'simple-git';
import { spawn } from 'cross-spawn';
import { OSSOperator } from './oss';
import { Bucket } from 'ali-oss';
import glob from 'glob';
import { CloudBuildTaskDTO } from './gateway';

export class CloudBuildTask extends WebsocketNotice {
  readonly repo: string;
  readonly dir: string;
  readonly name: string;
  readonly version: string;
  readonly branch: string;
  readonly buildCmd: string;
  readonly client: any;
  readonly sourceCodeDir: string;
  production: boolean;
  git: SimpleGit;
  readonly bucketName: string;
  buildPath: string;
  operator: OSSOperator;
  constructor(options: CloudBuildTaskDTO, client) {
    super(client);
    this.dir = resolve(
      homedir(),
      '.xhh-cli',
      'cloudbuild',
      `${options.name}@${options.version}`,
    );
    this.sourceCodeDir = resolve(this.dir, options.name);
    this.repo = options.repo;
    this.name = options.name;
    this.version = options.version;
    this.branch = options.branch;
    this.buildCmd = options.buildCmd;
    this.client = client;
    this.production = options.production;
    this.bucketName = this.getBucketName();
  }

  async prepare() {
    try {
      ensureDirSync(this.dir);
      emptyDirSync(this.dir);
      this.git = simpleGit(this.dir);
    } catch (e) {
      throw new Error(`构建准备工作准备失败，失败原因是${e.message}`);
    }
  }

  async downloadSource() {
    await this.git.clone(this.repo);
    this.git = simpleGit(this.sourceCodeDir);
    await this.git.checkout(['-b', this.branch, `origin/${this.branch}`]);
    if (!existsSync(this.sourceCodeDir)) {
      throw new Error(`下载源码失败，失败原因是源代码目录不存在`);
    }
  }

  async install() {
    await this.execCommand('npm install', `依赖包安装失败`);
  }

  async build() {
    await this.execCommand(this.buildCmd, `构建任务执行失败`);
  }

  async execCommand(commnad: string, failMsg: string): Promise<boolean> {
    const commands = commnad.split(' ');
    if (commands.length === 0) {
      throw new Error('无效的commands命令');
    }
    const execCommand = commands[0];
    if (execCommand === 'npm' || execCommand === 'cnpm') {
      const args = commands.slice(1) || [];
      return new Promise((resolve, reject) => {
        const proc = spawn(execCommand, args, {
          cwd: this.sourceCodeDir,
          stdio: 'pipe',
        });
        proc.on('exit', (c) => {
          console.log('build exit', c);
          resolve(true);
        });
        proc.on('error', (err) => {
          console.log(err);
          this.logError(err.message);
          reject(failMsg);
        });
        proc.stdout.on('data', (data) => {
          this.logInfo(data.toString());
        });
        proc.stderr.on('error', (error) => {
          this.logError(error.message);
          console.log(error);
          reject(failMsg);
        });
      });
    } else {
      throw new Error(`执行commnad失败，${execCommand}不是一个安全的命令`);
    }
  }

  getBucketName() {
    // return createHash('md5')
    //   .update(`${this.name}-${this.production}`)
    //   .digest('hex');
    return this.production
      ? process.env.OSS_PRODUCTION_BUCKET
      : process.env.OSS_DEVELOPMENT_BUCKET;
  }

  async preparePublish() {
    this.buildPath = await this.findBuildPath();
    // throw new Error('预发布检查失败');
    const operator = new OSSOperator();
    this.operator = operator;
    const store = operator.oss;
    const res = await store.listBuckets({});
    const buckets = (res as any).buckets as Bucket[];
    if (buckets.find((bucket) => bucket.name === this.bucketName)) {
      console.log(`已在oss找到对应的bucket名称 ${this.bucketName}`);
      store.useBucket(this.bucketName);
    } else {
      const bucket = await store.putBucket(this.bucketName);
      console.log(`未在oss找到对应的bucket名称 ${this.bucketName}`, bucket);
    }
  }

  async findBuildPath() {
    const buildDir = ['dist', 'build'];
    const buildPath = buildDir.find((dir) =>
      existsSync(resolve(this.sourceCodeDir, dir)),
    );
    if (buildPath) {
      return resolve(this.sourceCodeDir, buildPath);
    } else {
      throw new Error('构建目录不存在，请检查项目的构建目录是否为dist或build');
    }
  }

  async publish() {
    return new Promise((presolve, reject) => {
      glob(
        '**',
        {
          cwd: this.buildPath,
          nodir: true,
          ignore: '**/node_modules/**',
        },
        (err, files) => {
          if (err) {
            console.log(err);
            reject(`发布执行失败错误信息为:${err.message}`);
          }
          Promise.all(
            files.map(async (file) => {
              const filePath = resolve(this.buildPath, file);
              await this.operator.put(`${this.name}/${file}`, filePath);
            }),
          )
            .then(presolve)
            .catch((err) => {
              console.log(err);
              reject(`发布执行失败错误信息为:${err.message}`);
            });
        },
      );
    });
  }

  async clean(callback: () => void) {
    if (pathExistsSync(this.dir)) {
      removeSync(this.dir);
    }
    await callback();
  }
}
