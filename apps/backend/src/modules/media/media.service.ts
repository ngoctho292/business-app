import {
  Injectable,
  BadRequestException,
  PayloadTooLargeException,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import * as Minio from 'minio';
import { db, mediaAssets, sites } from '../../db';
import { eq, and, isNull, desc, lt, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import {
  MediaAssetDTO,
  PagedResponse,
  PresignedUploadResponse,
} from '@t-business/shared-types';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
];

const SITE_MAX_STORAGE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB free tier default

@Injectable()
export class MediaService implements OnModuleInit {
  private readonly logger = new Logger(MediaService.name);
  private minioClient: Minio.Client;
  private readonly publicBucket =
    process.env.MINIO_BUCKET_PUBLIC || 'media-public';

  constructor() {
    const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = parseInt(process.env.MINIO_PORT || '9000', 10);
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin_local';

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.publicBucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.publicBucket, 'us-east-1');
        this.logger.log(`Bucket ${this.publicBucket} đã được tạo mới.`);
      }

      // Cấu hình Policy Public Read (Anonymous Download) cho bucket media-public
      const publicPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.publicBucket}/*`],
          },
        ],
      };

      await this.minioClient.setBucketPolicy(
        this.publicBucket,
        JSON.stringify(publicPolicy)
      );
      this.logger.log(`Bucket ${this.publicBucket} đã được kích hoạt Public Read Policy.`);
    } catch (err: any) {
      this.logger.warn(
        `Không thể thiết lập policy cho bucket ${this.publicBucket}: ${err.message}`
      );
    }
  }


  async getMediaAssets(
    siteId: string,
    limit = 20,
    cursor?: string
  ): Promise<PagedResponse<MediaAssetDTO>> {
    const take = Math.min(Math.max(1, limit), 100);

    const conditions = [
      eq(mediaAssets.site_id, siteId),
      isNull(mediaAssets.deleted_at),
    ];

    if (cursor) {
      const cursorDate = new Date(cursor);
      conditions.push(lt(mediaAssets.created_at, cursorDate));
    }

    const records = await db.query.mediaAssets.findMany({
      where: and(...conditions),
      orderBy: [desc(mediaAssets.created_at)],
      limit: take + 1,
    });

    const hasMore = records.length > take;
    const dataItems = hasMore ? records.slice(0, take) : records;
    const nextCursor =
      hasMore && dataItems.length > 0
        ? dataItems[dataItems.length - 1].created_at.toISOString()
        : null;

    return {
      data: dataItems.map(this.mapAssetToDto),
      next_cursor: nextCursor,
      has_more: hasMore,
    };
  }

  async createPresignedUpload(
    siteId: string,
    filename: string = 'uploaded-file.jpg',
    mimeType: string = 'image/jpeg',
    fileSize: number = 0
  ): Promise<PresignedUploadResponse> {
    const safeFilename = (filename || 'uploaded-file.jpg').trim();
    const safeMimeType = (mimeType || 'image/jpeg').trim().toLowerCase();
    const safeFileSize = Number(fileSize || 0);

    // 1. Validate MIME Type
    if (!ALLOWED_MIME_TYPES.includes(safeMimeType)) {
      throw new BadRequestException(
        `Định dạng file ${safeMimeType} không được hỗ trợ. Chỉ hỗ trợ ảnh/video.`
      );
    }

    // 2. Enforce Quota per site
    const totalUsedResult = await db
      .select({
        total: sql<number>`coalesce(sum(${mediaAssets.file_size}), 0)`,
      })
      .from(mediaAssets)
      .where(
        and(eq(mediaAssets.site_id, siteId), isNull(mediaAssets.deleted_at))
      );

    const currentUsedBytes = Number(totalUsedResult[0]?.total || 0);

    if (currentUsedBytes + safeFileSize > SITE_MAX_STORAGE_BYTES) {
      throw new PayloadTooLargeException(
        'Dung lượng lưu trữ của website đã vượt quá hạn mức gói (2 GB).'
      );
    }

    // 3. Generate presigned URL for direct PUT
    const assetId = uuidv4();
    const cleanExt = safeFilename.includes('.')
      ? safeFilename.split('.').pop() || 'dat'
      : 'jpg';
    const objectKey = `${siteId}/${assetId}.${cleanExt}`;

    try {
      const presignedUrl = await this.minioClient.presignedPutObject(
        this.publicBucket,
        objectKey,
        15 * 60 // 15 minutes TTL
      );

      return {
        upload_url: presignedUrl,
        asset_id: assetId,
      };
    } catch (err: any) {
      // Fallback url for local testing if minio is initializing
      return {
        upload_url: `http://localhost:9000/${this.publicBucket}/${objectKey}`,
        asset_id: assetId,
      };
    }
  }

  async confirmUpload(
    siteId: string,
    assetId: string,
    filename: string = 'uploaded-file.jpg',
    mimeType: string = 'image/jpeg',
    fileSize: number = 0,
    userId?: string
  ): Promise<MediaAssetDTO> {
    const safeFilename = (filename || 'uploaded-file.jpg').trim();
    const safeMimeType = (mimeType || 'image/jpeg').trim().toLowerCase();
    const safeFileSize = Number(fileSize || 0);

    const cleanExt = safeFilename.includes('.')
      ? safeFilename.split('.').pop() || 'dat'
      : 'jpg';
    const objectKey = `${siteId}/${assetId}.${cleanExt}`;
    const cdnBase =
      process.env.MEDIA_CDN_BASE_URL || 'http://localhost:9000/media-public';
    const publicUrl = `${cdnBase}/${objectKey}`;

    const type = safeMimeType.startsWith('video/') ? 'video' : 'image';

    const [newAsset] = await db
      .insert(mediaAssets)
      .values({
        id: assetId,
        site_id: siteId,
        url: publicUrl,
        type,
        mime_type: safeMimeType,
        file_size: safeFileSize,
        filename: safeFilename,
        created_by: userId || null,
      })
      .returning();

    return this.mapAssetToDto(newAsset);
  }


  async deleteMediaAsset(
    siteId: string,
    assetId: string,
    userId: string
  ): Promise<void> {
    const asset = await db.query.mediaAssets.findFirst({
      where: and(
        eq(mediaAssets.id, assetId),
        eq(mediaAssets.site_id, siteId),
        isNull(mediaAssets.deleted_at)
      ),
    });

    if (!asset) {
      throw new NotFoundException('File không tồn tại hoặc đã bị xóa');
    }

    await db
      .update(mediaAssets)
      .set({
        deleted_at: new Date(),
      })
      .where(and(eq(mediaAssets.id, assetId), eq(mediaAssets.site_id, siteId)));
  }

  private mapAssetToDto(a: any): MediaAssetDTO {
    return {
      id: a.id,
      site_id: a.site_id,
      url: a.url,
      type: a.type,
      mime_type: a.mime_type,
      file_size: a.file_size,
      filename: a.filename,
      created_at: a.created_at.toISOString(),
      created_by: a.created_by || null,
      deleted_at: a.deleted_at ? a.deleted_at.toISOString() : null,
    };
  }
}
