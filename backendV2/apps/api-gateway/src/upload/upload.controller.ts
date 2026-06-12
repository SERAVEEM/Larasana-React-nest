import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Inject,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { SERVICES, UPLOAD_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { AdminGuard } from '../common/admin.guards';
import { firstValueFrom } from 'rxjs';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('access-token')
export class UploadGatewayController {
  constructor(
    @Inject(SERVICES.PRODUCTS) private commerceClient: ClientProxy,
  ) {}

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
          cb(new BadRequestException('Only image files (jpeg, png, webp, gif) are allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  @ApiOperation({ summary: 'Upload image to R2 storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Image file (max 5MB)' },
      },
    },
  })
  @ApiOkResponse({ description: 'Image uploaded successfully', schema: { properties: { url: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await firstValueFrom(
      this.commerceClient.send(UPLOAD_PATTERNS.UPLOAD_IMAGE, {
        buffer: file.buffer,
        filename: file.originalname,
        mimetype: file.mimetype,
        folder: 'product',
      }),
    );

    return result;
  }
}
