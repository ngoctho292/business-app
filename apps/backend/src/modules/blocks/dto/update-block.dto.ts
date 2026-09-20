import { IsObject, IsOptional, IsString, IsUUID, IsNumber } from 'class-validator';

export class UpdateBlockDto {
  @IsOptional()
  @IsObject()
  props?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  parent_id?: string | null;

  @IsOptional()
  @IsNumber()
  order_index?: number;
}
