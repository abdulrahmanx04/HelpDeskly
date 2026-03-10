import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { UserData } from 'src/common/interfaces/all.interfaces';
import { plainToInstance } from 'class-transformer';
import { CategoryResponseDto } from './dto/category.dto';
import { FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private categoryRepo: Repository<Category>,
    private userService: UsersService
  ) { }


  async create(dto: CreateCategoryDto, userData: UserData): Promise<CategoryResponseDto> {
    const category = await this.createCategory(dto, userData) as Category
    return plainToInstance(CategoryResponseDto, category, { excludeExtraneousValues: true })
  }

  async findAll(query: PaginateQuery, userData: UserData): Promise<{ meta: any, data: CategoryResponseDto[] }> {
    const categories = await this.getCategories(query, userData)
    return {
      ...categories,
      data: plainToInstance(CategoryResponseDto, categories.data, { excludeExtraneousValues: true })
    }
  }

  async findOne(id: string, userData: UserData): Promise<CategoryResponseDto> {
    const category = await this.categoryRepo.findOne({ where: { id, tenantId: userData.tenantId } })
    if (!category) throw new NotFoundException('Category not found')
    return plainToInstance(CategoryResponseDto, category, { excludeExtraneousValues: true })
  }


  async update(id: string, dto: UpdateCategoryDto, userData: UserData): Promise<CategoryResponseDto> {
    const category = await this.updateCategory(id, dto, userData)
    return plainToInstance(CategoryResponseDto, category, { excludeExtraneousValues: true })

  }

  async remove(id: string, userData: UserData) {
    await this.deleteCategory(id, userData)
  }

  async createCategory(dto: CreateCategoryDto, userData: UserData): Promise<Category> {
    const exists = await this.categoryRepo.findOne({
      where: {
        tenantId: userData.tenantId,
        name: dto.name
      }
    })
    if (exists) throw new ConflictException('Category name already exists')

    const category = this.categoryRepo.create({
      ...dto,
      tenantId: userData.tenantId
    })
    await this.categoryRepo.save(category)
    return category
  }
  async getCategories(query: PaginateQuery, userData: UserData) {
    const categories = await paginate(query, this.categoryRepo, {
      sortableColumns: ['createdAt', 'updatedAt', 'isActive', 'color'],
      searchableColumns: ['name', 'description'],
      filterableColumns: {
        name: [FilterOperator.ILIKE],
        description: [FilterOperator.ILIKE],
        color: [FilterOperator.EQ],
        isActive: [FilterOperator.EQ]
      },
      defaultSortBy: [['createdAt', 'DESC']],
      defaultLimit: 10,
      maxLimit: 100,
      where: { tenantId: userData.tenantId }
    })
    return categories
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, userData: UserData): Promise<Category> {
    this.userService.checkFieldsForUpdate(dto)
    const category = await this.categoryRepo.findOne({ where: { id, tenantId: userData.tenantId } })
    if (!category) throw new NotFoundException('Category not found')
    if (dto.name) {
      const exists = await this.categoryRepo.findOne({ where: { tenantId: userData.tenantId, name: dto.name } })
      if (exists) throw new ConflictException('Category name already exists')
    }
    return await this.categoryRepo.save(this.categoryRepo.merge(category, dto))
  }

  async deleteCategory(id: string, userData: UserData): Promise<void> {
    const category = await this.categoryRepo.findOne({ where: { id, tenantId: userData.tenantId } })
    if (!category) throw new NotFoundException('Category not found')
    await this.categoryRepo.remove(category)
  }


}
