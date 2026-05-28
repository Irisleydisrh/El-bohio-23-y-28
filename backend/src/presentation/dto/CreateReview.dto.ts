import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

/**
 * DTO para crear una reseña
 */
export class CreateReviewDto {
  @IsString()
  customerName!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}