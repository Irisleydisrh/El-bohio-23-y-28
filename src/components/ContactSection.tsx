import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const ContactSection = () => {
  const googleMapsUrl = "https://maps.app.goo.gl/yVaiBpyAE6vb8pYZ6?g_st=aw";
  const instagramUrl = "https://instagram.com/el_bohio_23y28";
  const whatsappUrl = "https://wa.me/5351234567";

  return (
    <section id="contacto" className="py-20 px-4 bg-gradient-warm">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-display text-gradient">Encuéntranos</h2>
        </motion.div>

        <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto">
          {/* Instagram */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 hover:bg-muted/20 p-4 rounded-xl transition-colors w-full"
          >
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 overflow-hidden">
              <img 
                src="/Instagram.png" 
                alt="Instagram" 
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground">Instagram</h3>
              <p className="text-muted-foreground text-sm">@el_bohio_23y28</p>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 hover:bg-muted/20 p-4 rounded-xl transition-colors w-full"
          >
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 overflow-hidden">
              <img 
                src="/Whatsapp.png" 
                alt="WhatsApp" 
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground">WhatsApp</h3>
              <p className="text-muted-foreground text-sm">+53 5 123 4567</p>
            </div>
          </a>

          {/* Dirección */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 hover:bg-muted/20 p-4 rounded-xl transition-colors w-full"
          >
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground">Dirección</h3>
              <p className="text-muted-foreground text-sm">Calle 23 esq. 28, Vedado, La Habana</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
