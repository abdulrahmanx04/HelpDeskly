import { BadRequestException, Injectable } from '@nestjs/common';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
@Injectable()
export class CloudinaryService {
   private allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.mp4', '.mov'];
   private allowedMimeTypes= [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',     
    'application/pdf',
  ]

private MAX_IMAGE_SIZE= 5 * 1024 * 1024
 private MAX_VIDEO_SIZE = 100 * 1024 * 1024
 private  MAX_RAW_SIZE = 10 * 1024 * 1024

  async uploadFile(file: Express.Multer.File, folder: string): Promise<UploadApiResponse>{
    if(!file) {
        throw new BadRequestException('No file uploaded')
      }
      if(file.size === 0) {
        throw new BadRequestException('File is empty')
      }

      if(!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file mimetype. Allowed: ${this.allowedMimeTypes.join(', ')}`,
       );
      }
      const ext= path.extname(file.originalname).toLowerCase()
      if(!this.allowedExtensions.includes(ext)) {
        throw new BadRequestException(
        `Invalid extension. Allowed: ${this.allowedExtensions.join(', ')}`,
        );
      }
      
      const isImage = file.mimetype.startsWith('image/')
      const isVideo = file.mimetype.startsWith('video/')
      const isRaw = !isImage && !isVideo

      if (isImage && file.size > this.MAX_IMAGE_SIZE) {
        throw new BadRequestException(
          `Image size exceeds limit of ${this.MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
        )
      }
      if (isVideo && file.size > this.MAX_VIDEO_SIZE) {
        throw new BadRequestException(
          `Video size exceeds limit of ${this.MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
        )
      }
      if (isRaw && file.size >this.MAX_RAW_SIZE) {
        throw new BadRequestException(
          `PDF size exceeds limit of ${this.MAX_RAW_SIZE / (1024 * 1024)}MB`,
        )
      }
       let resource_type: 'image' | 'video' | 'raw' = isImage ? 'image' : isVideo ? 'video' : 'raw'
      return new Promise((resolve,reject) => {
        cloudinary.uploader.upload_stream({folder,resource_type}, (error,result) => {
            if(error) reject(error)
            resolve(result as UploadApiResponse)     
        }).end(file.buffer)
      })
  }


   async deleteFile(publicId: string) {
        const result=await cloudinary.uploader.destroy(publicId)
        if(result.result !== 'ok') {
            throw new BadRequestException(`File delete failed: ${result.result}`);
        }
    }
}
