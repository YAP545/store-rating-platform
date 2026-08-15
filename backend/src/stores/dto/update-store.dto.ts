import { IsString, IsEmail, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Store name cannot be empty' })
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email address' })
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Store address cannot be empty' })
  @MaxLength(400)
  address?: string;
}
