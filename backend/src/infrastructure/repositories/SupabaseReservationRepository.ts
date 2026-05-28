import { Reservation, type ReservationProps, type ReservationStatus } from '../../domain/entities/reservation/Reservation.js';
import { type IReservationRepository } from '../../domain/repositories/IReservationRepository.js';
import supabase from '../supabase/client.js';

export class SupabaseReservationRepository implements IReservationRepository {
  async findAll(): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch reservations: ${error.message}`);

    return (data || []).map(row => new Reservation({
      id: row.id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      guests: row.guests,
      reservationDate: row.reservation_date,
      reservationTime: row.reservation_time,
      status: row.status as ReservationStatus,
      createdAt: new Date(row.created_at),
    }));
  }

  async findById(id: string): Promise<Reservation | null> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch reservation: ${error.message}`);
    }

    return new Reservation({
      id: data.id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      guests: data.guests,
      reservationDate: data.reservation_date,
      reservationTime: data.reservation_time,
      status: data.status as ReservationStatus,
      createdAt: new Date(data.created_at),
    });
  }

  async findByDate(date: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('reservation_date', date)
      .order('reservation_time', { ascending: true });

    if (error) throw new Error(`Failed to fetch reservations: ${error.message}`);

    return (data || []).map(row => new Reservation({
      id: row.id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      guests: row.guests,
      reservationDate: row.reservation_date,
      reservationTime: row.reservation_time,
      status: row.status as ReservationStatus,
      createdAt: new Date(row.created_at),
    }));
  }

  async findByStatus(status: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch reservations: ${error.message}`);

    return (data || []).map(row => new Reservation({
      id: row.id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      guests: row.guests,
      reservationDate: row.reservation_date,
      reservationTime: row.reservation_time,
      status: row.status as ReservationStatus,
      createdAt: new Date(row.created_at),
    }));
  }

  async save(reservation: Reservation): Promise<Reservation> {
    const plain = reservation.toPlain();
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        id: plain.id,
        customer_name: plain.customerName,
        customer_phone: plain.customerPhone,
        guests: plain.guests,
        reservation_date: plain.reservationDate,
        reservation_time: plain.reservationTime,
        status: plain.status,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create reservation: ${error.message}`);

    return new Reservation({
      id: data.id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      guests: data.guests,
      reservationDate: data.reservation_date,
      reservationTime: data.reservation_time,
      status: data.status as ReservationStatus,
      createdAt: new Date(data.created_at),
    });
  }

  async update(reservation: Reservation): Promise<Reservation> {
    const plain = reservation.toPlain();
    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: plain.status,
      })
      .eq('id', plain.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update reservation: ${error.message}`);

    return new Reservation({
      id: data.id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      guests: data.guests,
      reservationDate: data.reservation_date,
      reservationTime: data.reservation_time,
      status: data.status as ReservationStatus,
      createdAt: new Date(data.created_at),
    });
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete reservation: ${error.message}`);
  }
}