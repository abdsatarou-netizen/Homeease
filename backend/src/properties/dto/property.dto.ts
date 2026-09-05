import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreatePropertyDto {
  @IsString() categoryId: string;
  @IsString() title: string;
  @IsString() description: string;
  @IsEnum(TransactionType) transactionType: TransactionType;
  @IsNumber() price: number;

  @IsOptional() @IsInt() bedrooms?: number;
  @IsOptional() @IsInt() rooms?: number;
  @IsOptional() @IsBoolean() hasInternalShower?: boolean;
  @IsOptional() @IsBoolean() hasInternalToilet?: boolean;
  @IsOptional() @IsBoolean() hasParking?: boolean;
  @IsOptional() @IsBoolean() hasWater?: boolean;
  @IsOptional() @IsBoolean() hasElectricity?: boolean;
  @IsOptional() @IsBoolean() hasWifi?: boolean;
  @IsOptional() @IsBoolean() isFurnished?: boolean;
  @IsOptional() @IsNumber() surfaceArea?: number;

  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() commune?: string;
  @IsOptional() @IsString() quarter?: string;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;

  @IsOptional() @IsArray() @IsString({ each: true }) imageUrls?: string[];
}

export enum SortOption {
  RELEVANCE = 'relevance',
  RECENT = 'recent',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  POPULAR = 'popular',
}

export class SearchPropertiesDto {
  @IsOptional() @IsString() query?: string;
  @IsOptional() @IsString() categorySlug?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() commune?: string;
  @IsOptional() @IsString() quarter?: string;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) maxPrice?: number;

  @IsOptional() @Type(() => Number) @IsInt() bedrooms?: number;
  @IsOptional() @Type(() => Number) @IsInt() rooms?: number;

  @IsOptional() @Type(() => Boolean) @IsBoolean() hasInternalShower?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() hasInternalToilet?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() hasParking?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() hasWater?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() hasElectricity?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() hasWifi?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() isFurnished?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() ownerVerifiedOnly?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() verifiedOnly?: boolean;

  @IsOptional() @IsEnum(SortOption) sort?: SortOption;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 20;
}
