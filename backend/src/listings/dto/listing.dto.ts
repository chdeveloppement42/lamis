import { IsString, IsNumber, IsOptional, IsEnum, IsArray, Min } from 'class-validator';
import { ListingStatus, ListingType } from '@prisma/client';

export class CreateListingDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(ListingType)
  type: ListingType;

  @IsString()
  wilaya: string;

  @IsString()
  commune: string;

  @IsString()
  @IsOptional()
  quartier?: string;

  @IsNumber()
  @IsOptional()
  surface?: number;

  @IsNumber()
  @IsOptional()
  rooms?: number;

  @IsNumber()
  @IsOptional()
  floor?: number;

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(ListingType)
  type?: ListingType;

  @IsOptional()
  @IsString()
  wilaya?: string;

  @IsOptional()
  @IsString()
  commune?: string;

  @IsOptional()
  @IsString()
  quartier?: string;

  @IsOptional()
  @IsNumber()
  surface?: number;

  @IsOptional()
  @IsNumber()
  rooms?: number;

  @IsOptional()
  @IsNumber()
  floor?: number;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}
