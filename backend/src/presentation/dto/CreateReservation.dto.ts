import { IsString, IsOptional, IsInt, Min, Max, IsDateString, IsTime } from 'class-validator';

/**
 * DTO para crear una reservación
 */
export class CreateReservationDto {
  @IsString()
  customerName!: string;

  @IsString()
  customerPhone!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  guests!: number;

  @IsDateString()
  reservationDate!: string;

  @IsString()
  reservationTime!: string;
}

/**
 * DTO para actualizar estado de reservación
 */
export class UpdateReservationStatusDto {
  @IsString()
  status!: string;
}