import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Award, Users } from "lucide-react";
import { Link } from "react-router-dom";
import serviceWork from "@/assets/service-work.jpg";

const About = () => {
  const stats = [
    { icon: Calendar, label: "Years of Experience", value: "30+" },
    { icon: Award, label: "Expert Technicians", value: "Certified" },
    { icon: MapPin, label: "Location", value: "Hudson Valley" },
    { icon: Users, label: "Customer Focus", value: "100%" },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">About J.D.F. Performance Marine</h1>
            <p className="text-xl text-muted-foreground">
              Three decades of passion, expertise, and dedication to high-performance marine service
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  Located along the beautiful Hudson River in New Windsor, NY, our Performance Marine Shop proudly serves the Hudson Valley with over 30 years of expert experience in the marine mechanical and service industry.
                </p>
                <p>
                  We specialize in high-performance marine service, with a focus on MerCruiser and Mercury Racing products as well as Yamaha and Kawasaki Jet Skis.
                </p>
                <p>
                  Our seasoned team is dedicated to delivering top-tier mechanical services, diagnostics, and performance upgrades for powerboats, sport boats, and performance watercraft.
                </p>
              </div>
            </div>
            <div className="relative h-[500px] rounded-xl overflow-hidden shadow-2xl">
              <img
                src={serviceWork}
                alt="Our workshop"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">What Sets Us Apart</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-primary">Expert Specialization</h3>
                <p className="text-muted-foreground">
                  We don't just work on boats—we specialize in high-performance marine equipment. From weekend warriors to serious speed enthusiasts, we understand what it takes to keep your vessel running at peak performance.
                </p>
              </Card>
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-secondary">Comprehensive Service</h3>
                <p className="text-muted-foreground">
                  Whether you need routine maintenance, high-performance tuning, or custom rigging, we provide precision work backed by decades of hands-on knowledge and a passion for marine performance.
                </p>
              </Card>
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-primary">Convenient Solutions</h3>
                <p className="text-muted-foreground">
                  Conveniently situated near the water, we offer dockside service, water testing, and seasonal solutions to keep your vessel running at peak performance throughout the year.
                </p>
              </Card>
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-secondary">Trusted Partnership</h3>
                <p className="text-muted-foreground">
                  We are the Hudson Valley's trusted source for reliable, high-performance marine service. Our reputation is built on quality work, honest communication, and customer satisfaction.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Experience the Difference</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join countless satisfied customers who trust J.D.F. Performance Marine for their high-performance marine service needs.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg">
            <Link to="/contact">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;
