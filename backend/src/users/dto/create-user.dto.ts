import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
  Matches,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Length(20, 60, { message: 'Name must be between 20 and 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @MaxLength(400, { message: 'Address cannot exceed 400 characters' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 16, { message: 'Password must be between 8 and 16 characters' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message: 'Password must contain at least one special character',
  })
  password: string;

  @IsEnum(Role, { message: 'Role must be SYSTEM_ADMIN, NORMAL_USER, or STORE_OWNER' })
  role: Role;
}
