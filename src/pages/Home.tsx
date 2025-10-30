import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Wrench, Zap, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBoat from "@/assets/hero-boat.jpg";
import serviceWork from "@/assets/service-work.jpg";
import { popularServices } from "@/content/services";

const Home = () => {
  const features = [
    {
      icon: Wrench,
      title: "Expert Service",
      description: "30+ years of specialized marine mechanical expertise",
    },
    {
      icon: Zap,
      title: "High Performance",
      description: "Race engine building and performance upgrades",
    },
    {
      icon: Shield,
      title: "Trusted Partner",
      description: "Hudson Valley's go-to for reliable marine service",
    },
  ];

  

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBoat})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Hudson Valley's
              <span className="text-primary block">Performance Marine</span>
              Experts
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              Over 30 years of expert experience in high-performance marine service, from weekend warriors to serious speed enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg shadow-lg hover:shadow-xl transition-all">
                <a href="tel:845-787-4241">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now: 845-787-4241
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg" className="text-lg">
                <Link to="/services">
                  View Services
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Precision Work. Decades of Knowledge.</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Located along the beautiful Hudson River in New Windsor, NY, our Performance Marine Shop proudly serves the Hudson Valley with over 30 years of expert experience in the marine mechanical and service industry.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                We specialize in high-performance marine service, with a focus on MerCruiser and Mercury Racing products as well as Yamaha and Kawasaki Jet Skis.
              </p>
              <Button asChild size="lg">
                <Link to="/about">
                  Learn More About Us
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
              <img
                src={serviceWork}
                alt="Expert marine service"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Popular Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From routine maintenance to high-performance upgrades, we provide precision work backed by decades of hands-on knowledge.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {popularServices.map((service, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <h3 className="font-semibold">{service}</h3>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/services">
                View All Services
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Contact us today for a quote or to schedule your service. We offer dockside service and water testing for your convenience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg">
              <a href="tel:845-787-4241">
                <Phone className="w-5 h-5 mr-2" />
                845-787-4241
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg border-white text-white hover:bg-white hover:text-primary">
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
