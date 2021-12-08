import OSS from 'ali-oss';

export class OSSOperator {
  oss: OSS;
  constructor() {
    this.oss = new OSS({
      accessKeyId: process.env.OSS_ACCESS_KEY,
      accessKeySecret: process.env.OSS_ACCESS_SECRET_KEY,
      endpoint: process.env.OSS_ENDPOINT,
    });
  }

  async put(object, localPath, options = {}) {
    await this.oss.put(object, localPath, options);
  }
}
