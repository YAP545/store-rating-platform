import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsInt({ message: 'Store ID must be a valid integer' })
  @IsNotEmpty({ message: 'Store ID is required' })
  storeId: number;

  @IsInt({ message: 'Rating must be an integer between 1 and 5' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;
}
