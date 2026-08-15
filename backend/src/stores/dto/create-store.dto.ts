import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty({ message: 'Store name is required' })
  @MaxLength(60, { message: 'Store name cannot exceed 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Store email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Store address is required' })
  @MaxLength(400, { message: 'Store address cannot exceed 400 characters' })
  address: string;

  @IsOptional()
  @IsInt({ message: 'Owner ID must be a valid integer' })
  ownerId?: number | null;
}
