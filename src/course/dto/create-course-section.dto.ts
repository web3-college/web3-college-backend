import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCourseSectionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  order: number;

  @IsOptional()
  @IsString()
  videoUrl: string;
}
