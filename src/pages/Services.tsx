import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { servicesCatalog } from "@/content/services";

const Services = () => {
  

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive marine services from routine maintenance to high-performance upgrades. Whether you need tune-ups or custom race engine building, we deliver precision work backed by 30+ years of experience.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {servicesCatalog.map((serviceGroup, index) => (
              <Card key={index} className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-primary">{serviceGroup.category}</h2>
                <ul className="space-y-4">
                  {serviceGroup.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">We Specialize In</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6 border-2 border-primary/20">
                <h3 className="text-xl font-bold mb-4 text-primary">MerCruiser & Mercury Racing</h3>
                <p className="text-muted-foreground">
                  Expert diagnostics, service, and performance upgrades for MerCruiser and Mercury Racing products. From routine maintenance to race-ready builds.
                </p>
              </Card>
              <Card className="p-6 border-2 border-secondary/20">
                <h3 className="text-xl font-bold mb-4 text-secondary">Yamaha & Kawasaki Jet Skis</h3>
                <p className="text-muted-foreground">
                  Comprehensive 2-stroke and 4-stroke service, repair, and performance upgrades for Yamaha and Kawasaki personal watercraft.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Schedule Service?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contact us today for a quote or to discuss your marine service needs.
          </p>
          <Button asChild size="lg">
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Services;
