import { IsBoolean, IsNotEmpty, IsOptional, Length } from "class-validator";



export class CreateCategoryDto {
    @IsNotEmpty()
    @Length(3,50)
    name: string


    @IsOptional()
    @Length(3,5000)
    description?: string

    
    @IsOptional()
    @Length(1,7)
    color?: string

    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}


export class UpdateCategoryDto {

    @IsOptional()
    @Length(3,50)
    name: string


    @IsOptional()
    @Length(3,5000)
    description?: string

    
    @IsOptional()
    @Length(1,7)
    color?: string

    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}
