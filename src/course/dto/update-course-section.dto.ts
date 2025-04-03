import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateCourseSectionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  videoUrl?: string;
}
