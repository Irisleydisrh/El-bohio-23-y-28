import logo from '@/assets/logo.jpeg';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <img src={logo} alt="El Bohío" className="w-8 h-8 rounded-full object-cover" />
          <span className="font-display text-lg text-gradient">El Bohío 23 y 28</span>
        </div>
        
        <p>© {new Date().getFullYear()} El Bohío 23 y 28. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
