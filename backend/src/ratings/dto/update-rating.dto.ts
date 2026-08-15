import { IsInt, Max, Min } from 'class-validator';

export class UpdateRatingDto {
  @IsInt({ message: 'Rating must be an integer between 1 and 5' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;
}
