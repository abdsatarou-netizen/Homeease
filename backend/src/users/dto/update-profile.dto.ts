import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsUrl() avatarUrl?: string;
}
