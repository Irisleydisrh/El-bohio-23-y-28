import { motion } from 'framer-motion';
import { MapPin, Clock, ChevronDown } from 'lucide-react';
import logo from '@/assets/logo.jpeg';

const HeroSection = () => {
  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToReservation = () => {
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-warm">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15, duration: 1 }}
          className="mb-6"
        >
          <div className="w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-primary/60 glow-primary">
            <img src={logo} alt="El Bohío 23 y 28" className="w-full h-full object-cover" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display text-gradient leading-tight"
        >
          El Bohío 23 y 28
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-xl md:text-2xl text-secondary font-display tracking-wider mt-2"
        >
          Entrepanes al Carbón 🍔
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-base md:text-lg text-foreground/80 mt-4 max-w-md"
        >
          💪🏼 Ven y Crea tu propio pan con lechón...!!! 😎
        </motion.p>

        {/* Info badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-6"
        >
          <div className="flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            24 horas • Todos los días
          </div>
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm text-foreground/70">
            <MapPin className="w-4 h-4 text-primary" />
            Calle 23 esq. 28, Vedado
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 mt-10"
        >
          <button
            onClick={scrollToMenu}
            className="px-8 py-4 bg-primary text-primary-foreground font-display text-xl tracking-wider rounded-full hover:scale-105 transition-transform glow-primary"
          >
            Ver Menú 🔥
          </button>
          <button
            onClick={scrollToReservation}
            className="px-8 py-4 border-2 border-secondary text-secondary font-display text-xl tracking-wider rounded-full hover:bg-secondary hover:text-secondary-foreground transition-all"
          >
            Reservar Mesa 🪑
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 cursor-pointer"
        onClick={scrollToMenu}
      >
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <ChevronDown className="w-8 h-8 text-primary/60" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
