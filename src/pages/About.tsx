import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Award, Users } from "lucide-react";
import { Link } from "react-router-dom";
// MODIFICATION: Import the new, real image
import serviceWork from "@/assets/1766188002157.jpg";
import { Helmet } from 'react-helmet-async';

const About = () => {
  const stats = [
    { icon: Calendar, label: "Years of Experience", value: "30+" },
    { icon: Award, label: "Expert Technicians", value: "Certified" },
    { icon: MapPin, label: "Location", value: "Hudson Valley" },
    { icon: Users, label: "Customer Focus", value: "100%" },
  ];

  return (
    <>
      <Helmet>
        <title>About Us | J.D.F. Performance Marine</title>
        <meta 
          name="description" 
          content="Learn about the J.D.F. Performance Marine team, our 30+ years of high-performance marine expertise, and our specialization in MerCruiser, Mercury Racing, and go-fast boats." 
        />
        <link rel="canonical" href="https://jdfperformancemarine.com/about" /> 
        <meta property="og:title" content="About Us | J.D.F. Performance Marine" />
        <meta property="og:description" content="Learn about the J.D.F. Performance Marine team and our 30+ years of high-performance marine expertise." />
        <meta property="og:url" content="https://jdfperformancemarine.com/about" />
        <meta property="og:image" content="/logo.png" />
        <meta name="twitter:title" content="About Us | J.D.F. Performance Marine" />
        <meta name="twitter:description" content="Learn about the J.D.F. Performance Marine team and our 30+ years of high-performance marine expertise." />
        <meta name="twitter:image" content="/logo.png" />
      </Helmet>

      <div className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                About J.D.F. Performance Marine
              </h1>
              <p className="text-xl text-muted-foreground">
                Three decades of passion, expertise, and dedication to
                high-performance marine service
              </p>
            </div>
          </div>
        </section>

        {/* Main Content - MODIFICATION: Added 'bg-watermarked' */}
        <section className="py-20 bg-background bg-watermarked">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  Our Story: 30+ Years of Hudson Valley Marine Performance
                </h2>
                <div className="space-y-4 text-lg text-muted-foreground">
                  <p>
                    Located along the beautiful Hudson River in New Windsor, NY,
                    our Performance Marine Shop proudly serves the Hudson Valley
                    with over 30 years of expert experience in the marine
                    mechanical and service industry.
                  </p>
                  <p>
                    From weekend warriors to serious speed enthusiasts, we are the
                    Hudson Valley's trusted source for reliable, high-performance
                    marine service. Our passion is performance, and our mission is
                    to keep your vessel running at its absolute peak.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <h3 className="text-2xl font-semibold">
                    Decades of Hands-On Expertise
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Our seasoned team is dedicated to delivering top-tier
                    mechanical services, diagnostics, and performance upgrades for
                    powerboats, sport boats, and performance watercraft. We
                    provide precision work backed by decades of hands-on
                    knowledge.
                  </p>
                  <div>
                    <div className="font-medium mb-2">
                      Our specializations include:
                    </div>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>MerCruiser &amp; Mercury Racing Products</li>
                      <li>Yamaha &amp; Kawasaki Jet Skis</li>
                      <li>High-Performance Tuning &amp; Custom Rigging</li>
                      <li>Routine Maintenance &amp; Diagnostics</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <h3 className="text-2xl font-semibold">
                    Service That Comes to You
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    We know that convenience is key. Conveniently situated near
                    the water, we are proud to offer:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Dockside Service</li>
                    <li>Water Testing</li>
                    <li>Seasonal Solutions</li>
                  </ul>
                  <p className="text-muted-foreground text-lg">
                    Whether you need a pre-season tune-up or a complex performance
                    upgrade, we have the expertise and passion to get the job done
                    right.
                  </p>
                </div>
              </div>
              <div className="relative h-[500px] rounded-xl overflow-hidden shadow-2xl">
                <img
                  // MODIFICATION: Image source is now the real engine on the pallet
                  src={serviceWork}
                  alt="Our workshop"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats - MODIFICATION: Added 'bg-watermarked' */}
        <section className="py-20 bg-card bg-watermarked">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="p-8 text-center hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 mb-4 group-hover:shadow-glow-orange transition-all">
                    <stat.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What Sets Us Apart - MODIFICATION: Added 'bg-watermarked' */}
        <section className="py-20 bg-background bg-watermarked">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-12 text-center">
                What Sets Us Apart
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-8 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary/50">
                  <h3 className="text-2xl font-bold mb-4 text-primary">
                    Expert Specialization
                  </h3>
                  <p className="text-muted-foreground">
                    We don't just work on boats—we specialize in high-performance
                    marine equipment. From weekend warriors to serious speed
                    enthusiasts, we understand what it takes to keep your vessel
                    running at peak performance.
                  </p>
                </Card>
                <Card className="p-8 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-secondary/50">
                  <h3 className="text-2xl font-bold mb-4 text-secondary">
                    Comprehensive Service
                  </h3>
                  <p className="text-muted-foreground">
                    Whether you need routine maintenance, high-performance tuning,
                    or custom rigging, we provide precision work backed by decades
                    of hands-on knowledge and a passion for marine performance.
                  </p>
                </Card>
                <Card className="p-8 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary/50">
                  <h3 className="text-2xl font-bold mb-4 text-primary">
                    Convenient Solutions
                  </h3>
                  <p className="text-muted-foreground">
                    Conveniently situated near the water, we offer dockside
                    service, water testing, and seasonal solutions to keep your
                    vessel running at peak performance throughout the year.
                  </p>
                </Card>
                <Card className="p-8 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-secondary/50">
                  <h3 className="text-2xl font-bold mb-4 text-secondary">
                    Trusted Partnership
                  </h3>
                  <p className="text-muted-foreground">
                    We are the Hudson Valley's trusted source for reliable,
                    high-performance marine service. Our reputation is built on
                    quality work, honest communication, and customer satisfaction.
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
              Join countless satisfied customers who trust J.D.F. Performance
              Marine for their high-performance marine service needs.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg">
              <Link to="/contact">Get Started Today</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;