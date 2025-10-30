import { Phone, Mail, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-card via-card to-muted/30 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">J.D.F. Performance Marine</h3>
            <p className="text-muted-foreground mb-4">
              Hudson Valley's trusted source for high-performance marine service with over 30 years of experience.
            </p>
            <p className="text-sm text-muted-foreground">
              New Windsor, NY
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:845-787-4241"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group"
                >
                  <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  845-787-4241
                </a>
              </li>
              <li>
                <a
                  href="mailto:JDFperformancemarine@gmail.com"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group whitespace-nowrap"
                >
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  JDFperformancemarine@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/jdf_marine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group"
                >
                  <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  @jdf_marine
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} J.D.F. Performance Marine. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
