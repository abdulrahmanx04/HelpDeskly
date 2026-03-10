import { UploadApiResponse } from "cloudinary";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { AttachmentInterface } from "../interfaces/all.interfaces";


export async function uploadFiles(cloudinaryService: CloudinaryService, folder: string, files?: Express.Multer.File[]): Promise<AttachmentInterface[]> {

    if(!files?.length) return []
    const uploads= files.map(async(file) => {
        const  result: UploadApiResponse= await cloudinaryService.uploadFile(file,folder)
        return {
            fileName: result.original_filename,
            url: result.secure_url,
            publicId: result.public_id,
            mimeType: file.mimetype,
            size: result.bytes
        }
    })
    return Promise.all(uploads)
}