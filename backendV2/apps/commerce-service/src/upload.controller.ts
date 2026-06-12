import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UPLOAD_PATTERNS } from '../../../libs/shared/src';
import { R2Service } from './r2.service';

@Controller()
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly r2Service: R2Service) {}

  @MessagePattern(UPLOAD_PATTERNS.UPLOAD_IMAGE)
  async uploadImage(
    @Payload()
    data: {
      buffer: { type: 'Buffer'; data: number[] };
      filename: string;
      mimetype: string;
      folder?: string;
    },
  ) {
    this.logger.log(`Receiving upload: ${data.filename} (${data.mimetype})`);

    // Reconstruct the Buffer from the serialized data
    const fileBuffer = Buffer.from(data.buffer.data);

    const url = await this.r2Service.uploadFile(
      fileBuffer,
      data.filename,
      data.mimetype,
      data.folder || 'product',
    );

    return { url };
  }

  @MessagePattern(UPLOAD_PATTERNS.DELETE_IMAGE)
  async deleteImage(@Payload() data: { key: string }) {
    await this.r2Service.deleteFile(data.key);
    return { success: true };
  }
}
