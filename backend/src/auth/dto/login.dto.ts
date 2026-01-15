import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email', example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mot de passe', example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string;
}
