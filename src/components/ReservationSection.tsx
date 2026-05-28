import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Users, Clock } from 'lucide-react';
import { buildReservationMessage, openWhatsApp } from '@/lib/whatsapp';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ReservationSection = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const { toast } = useToast();

// Solo letras (incluye acentos y espacios)
    const nameRegex = /^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/;
    // Teléfono Cuba: móvil 8 dígitos (opcional +53 y sin espacios/guiones)
    const phoneRegex = /^(?:\+53)?[1-9]\d{7}$/;
    // Solo dígitos y + para filtrar en onChange
    const cleanPhone = (val: string) => {
      // Cuba: solo dígitos, permite +53 al inicio
      // Elimina cualquier caracter que no sea dígito o +
      return val.replace(/[^\d+]/g, '');
    };

    const validate = () => {
      const newErrors: { name?: string; phone?: string } = {};

      if (!name.trim()) {
        newErrors.name = 'Ingresa tu nombre';
      } else if (!nameRegex.test(name.trim())) {
        newErrors.name = 'Solo letras, sin números';
      }

      // Validar teléfono: debe tener 8 dígitos (o 10-12 con prefijo internacional)
      const digitsOnly = cleanPhone(phone).replace(/\D/g, '');
      if (!digitsOnly) {
        newErrors.phone = 'Ingresa tu teléfono';
      } else if (digitsOnly.length < 8 || digitsOnly.length > 12) {
        newErrors.phone = 'Teléfono Cuba: 8 dígitos (ej: 5XXXXXXX)';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Filter to only digits and +
      const filtered = cleanPhone(e.target.value);
      // Limit to reasonable length (Cuba: +53 + 8 digits = 11 max)
      const limited = filtered.slice(0, 11);
      setPhone(limited);
      if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      toast({ title: 'Selecciona fecha y hora', variant: 'destructive' });
      return;
    }

    if (!validate()) return;

    const cleanPhoneVal = cleanPhone(phone);

    // Save to database
    await supabase.from('reservations').insert({
      customer_name: name.trim(),
      customer_phone: cleanPhoneVal,
      reservation_date: date,
      reservation_time: time,
      guests,
    });

    const message = buildReservationMessage({
      name: name.trim(),
      phone: cleanPhoneVal,
      date,
      time,
      guests,
    });

    openWhatsApp(message);
    toast({ title: '¡Reservación enviada! 🪑', description: 'Te contactaremos por WhatsApp para confirmar' });
    setName('');
    setPhone('');
    setDate('');
    setTime('');
    setGuests(2);
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <section id="reservar" className="py-20 px-4 bg-gradient-warm">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-5xl md:text-6xl font-display text-gradient">Reservar Mesa</h2>
          <p className="text-muted-foreground mt-2">Asegura tu lugar en El Bohío 🪑</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="bg-gradient-card border border-border rounded-2xl p-6 space-y-4"
        >
          <div>
            <input 
              value={name} 
              onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }} 
              placeholder="Tu nombre" 
              className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`} 
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+53 5XXXXXXXX"
              className={`${inputClass} ${errors.phone ? 'border-red-500' : ''}`} 
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <CalendarDays className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} pl-10`} />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`${inputClass} pl-10`} />
            </div>
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className={`${inputClass} pl-10 appearance-none`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'persona' : 'personas'}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-secondary text-secondary-foreground font-display text-xl tracking-wider rounded-xl hover:scale-[1.02] transition-transform active:scale-[0.98]"
          >
            Reservar por WhatsApp 📱
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default ReservationSection;
