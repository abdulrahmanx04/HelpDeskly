import { BadRequestException, Injectable } from '@nestjs/common';
import { UserResponseDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserData } from 'src/common/interfaces/all.interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/auth.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';
import { UpdateTenantDto } from 'src/tenants/dto/create-tenant.dto';
import { UpdateCategoryDto } from 'src/categories/dto/create-category.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>,
    private cloudinaryService: CloudinaryService
  ) { }

  async findOne(id: string, userData: UserData): Promise<UserResponseDto> {
    const user = await this.userRepo.findOneOrFail({ where: { id: userData.id } })
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true })
  }



  async update(dto: UpdateUserDto, userData: UserData, file?: Express.Multer.File) : Promise<UserResponseDto>{
    this.checkFieldsForUpdate(dto, file)
    const user = await this.userRepo.findOneOrFail({ where: { id: userData.id } })
    await this.uploadAvatar(user, file)
    await this.userRepo.save(this.userRepo.merge(user, dto))
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true })
  }

  async remove(userData: UserData): Promise<void> {
    const user = await this.userRepo.findOneOrFail({ where: { id: userData.id } })
    if (user.avatar && user.avatarPublicId) {
      await this.cloudinaryService.deleteFile(user.avatarPublicId);
    }
    await this.userRepo.delete({id: userData.id})
  }

  async uploadAvatar(user: User, file?: Express.Multer.File): Promise<void> {
    if (file) {
      if (user.avatarPublicId) {
        await this.cloudinaryService.deleteFile(user.avatarPublicId);
      }
      const upload = await this.cloudinaryService.uploadFile(file, 'avatar') as UploadApiResponse
      user.avatar = upload.secure_url
      user.avatarPublicId = upload.public_id
    }
  }

  checkFieldsForUpdate(dto: UpdateUserDto | UpdateTenantDto | UpdateCategoryDto, file?: Express.Multer.File): void {
    const hasFields = Object.values(dto).some(v => v != null);
    if (!hasFields && !file) {
      throw new BadRequestException('No fields provided for update');
    }
  }

}
