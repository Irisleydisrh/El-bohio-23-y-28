import { Entity } from '../base/Entity.js';
import { v4 as uuidv4 } from 'uuid';

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface ReservationProps {
  id: string;
  customerName: string;
  customerPhone: string;
  guests: number;
  reservationDate: string;
  reservationTime: string;
  status: ReservationStatus;
  createdAt: Date;
}

export interface CreateReservationProps {
  customerName: string;
  customerPhone: string;
  guests: number;
  reservationDate: string;
  reservationTime: string;
}

export class Reservation extends Entity<string> {
  private readonly _customerName: string;
  private readonly _customerPhone: string;
  private readonly _guests: number;
  private readonly _reservationDate: string;
  private readonly _reservationTime: string;
  private _status: ReservationStatus;
  private readonly _createdAt: Date;

  constructor(props: ReservationProps) {
    super(props.id);
    this._customerName = props.customerName;
    this._customerPhone = props.customerPhone;
    this._guests = props.guests;
    this._reservationDate = props.reservationDate;
    this._reservationTime = props.reservationTime;
    this._status = props.status;
    this._createdAt = props.createdAt;
  }

  get customerName(): string { return this._customerName; }
  get customerPhone(): string { return this._customerPhone; }
  get guests(): number { return this._guests; }
  get reservationDate(): string { return this._reservationDate; }
  get reservationTime(): string { return this._reservationTime; }
  get status(): ReservationStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }

  confirm(): void {
    this._status = 'confirmed';
  }

  cancel(): void {
    this._status = 'cancelled';
  }

  complete(): void {
    this._status = 'completed';
  }

  toPlain(): ReservationProps {
    return {
      id: this._id,
      customerName: this._customerName,
      customerPhone: this._customerPhone,
      guests: this._guests,
      reservationDate: this._reservationDate,
      reservationTime: this._reservationTime,
      status: this._status,
      createdAt: this._createdAt,
    };
  }

  static create(props: CreateReservationProps): Reservation {
    return new Reservation({
      id: uuidv4(),
      customerName: props.customerName,
      customerPhone: props.customerPhone,
      guests: props.guests,
      reservationDate: props.reservationDate,
      reservationTime: props.reservationTime,
      status: 'pending',
      createdAt: new Date(),
    });
  }
}