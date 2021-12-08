import { OSSOperator } from './oss';
import { Injectable } from '@nestjs/common';
import { BizException } from '@/exception/biz.exception';

@Injectable()
export class EventService {
  async getOssFiles(param) {
    const { production, projectName: prefix } = param;
    if (!prefix) {
      throw new BizException('项目名称为空');
    }
    const store = new OSSOperator();
    store.oss.useBucket(
      production === 'true'
        ? process.env.OSS_PRODUCTION_BUCKET
        : process.env.OSS_DEVELOPMENT_BUCKET,
    );
    const res = await store.oss.list(
      {
        prefix,
        ['max-keys']: 100,
      },
      {},
    );
    return res.objects || [];
  }

  async getOssFileByPath(ossFileParam) {
    const { fileDir, production, filePath } = ossFileParam;
    if (!fileDir) {
      throw new BizException('请提供OSS文件路径');
    }
    const store = new OSSOperator();
    store.oss.useBucket(
      production === 'true'
        ? process.env.OSS_PRODUCTION_BUCKET
        : process.env.OSS_DEVELOPMENT_BUCKET,
    );
    const files = await store.oss.list(
      { prefix: fileDir, ['max-keys']: 100 },
      {},
    );
    if (!filePath) return files.objects || [];
    const fileName = `${fileDir}/${filePath}`;
    return files.objects.filter((file) => file.name === fileName) || [];
  }
}
