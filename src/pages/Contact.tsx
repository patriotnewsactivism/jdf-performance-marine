import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Instagram, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl text-muted-foreground">
              Ready to get started? Contact us today for a quote or to discuss your marine service needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Phone */}
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Call Us</h3>
              <a
                href="tel:845-787-4241"
                className="text-lg text-primary hover:underline block mb-2"
              >
                845-787-4241
              </a>
              <p className="text-sm text-muted-foreground">
                Give us a call for quotes and appointments
              </p>
            </Card>

            {/* Email */}
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-6">
                <Mail className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Email Us</h3>
              <a
                href="mailto:JDFperformancemarine@gmail.com"
                className="text-lg text-secondary hover:underline block mb-2 break-all"
              >
                JDFperformancemarine@gmail.com
              </a>
              <p className="text-sm text-muted-foreground">
                Send us your questions or service requests
              </p>
            </Card>

            {/* Instagram */}
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Instagram className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <a
                href="https://www.instagram.com/jdf_marine"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-primary hover:underline block mb-2"
              >
                @jdf_marine
              </a>
              <p className="text-sm text-muted-foreground">
                See our latest projects and updates
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Location */}
              <Card className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Location</h3>
                </div>
                <p className="text-lg mb-4">
                  <strong>J.D.F. Performance Marine</strong>
                </p>
                <p className="text-muted-foreground mb-2">
                  New Windsor, NY
                </p>
                <p className="text-muted-foreground">
                  Located along the beautiful Hudson River
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Serving the Hudson Valley and surrounding areas
                </p>
              </Card>

              {/* Services Note */}
              <Card className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold">Service Options</h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Dockside service available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Water testing services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Boat & PWC transportation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Seasonal winterizing and shrinkwrap</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-6">
                  Call us to schedule your service or discuss your specific needs
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience Expert Service?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Contact J.D.F. Performance Marine today. We're here to help with all your high-performance marine service needs.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg">
            <a href="tel:845-787-4241">
              <Phone className="w-5 h-5 mr-2" />
              Call 845-787-4241
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Contact;
