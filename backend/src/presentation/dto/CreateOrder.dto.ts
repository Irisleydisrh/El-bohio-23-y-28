import { 
  IsString, 
  IsOptional, 
  IsInt, 
  Min, 
  IsEnum, 
  IsArray, 
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../../config/entities/Order.js';

/**
 * DTO para item de orden
 */
export class CreateOrderItemDto {
  @IsUUID()
  menuItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsInt()
  @Min(1)
  unitPrice!: number;
}

/**
 * DTO para crear una orden
 */
export class CreateOrderDto {
  @IsString()
  customerName!: string;

  @IsString()
  customerPhone!: string;

  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

/**
 * DTO para actualizar estado de orden
 */
export class UpdateOrderStatusDto {
  @IsString()
  status!: string;
}