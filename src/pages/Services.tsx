import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
// MODIFICATION: Swapped the image imports for their new locations
import serviceCloseup from "@/assets/engine-supercharger-closeup.jpg";
import heroImage from "@/assets/engine-on-pallet.jpg"; // This is now the hero

const Services = () => {
  const services = [
    {
      category: "Performance & Racing",
      items: [
        "High-Performance / Race Engine Building or Upgrades",
        "High-Performance Boat Setup and Dialing In",
        "Custom Rigging",
        "EFI Conversions",
      ],
    },
    {
      category: "Engine & Drive Services",
      items: [
        "Repowers",
        "Outdrive Rebuilds or Upgrades",
        "Engine and Drive Oil Changes",
        "Tune Ups",
      ],
    },
    {
      category: "Diagnostics & Repairs",
      items: [
        "Mercury / MerCruiser Diagnostics",
        "Yamaha and Kawasaki Jetski 2 stroke / 4 stroke service, repair, and upgrades",
        "Maintenance and Repairs (Impellers, Bellos, Transom Assemblies, Engine Alignments, etc.)",
      ],
    },
    {
      category: "Boat & PWC Care",
      items: [
        "Hull, Interior and Electronic Upgrades",
        "Winterizing and Shrinkwrap (Boat and PWC)",
        "Water Testing",
        "Boat / PWC Transportation",
      ],
    },
    {
      category: "Specialty Services",
      items: ["Dockside Service"],
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* MODIFICATION: Hero section now uses the 'engine-on-pallet.jpg' image */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Our Services
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              From routine maintenance to full-scale performance builds, we
              deliver precision work backed by over 30 years of expertise.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid - MODIFICATION: Added 'bg-watermarked' */}
      <section className="py-20 bg-background bg-watermarked">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((serviceGroup, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary/50"
              >
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {serviceGroup.category}
                </h2>
                <ul className="space-y-4">
                  {serviceGroup.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start gap-3 group"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mt-0.5 group-hover:shadow-glow-orange transition-all">
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

      {/* MODIFICATION: Updated Specializations section - Added 'bg-watermarked' */}
      <section className="py-20 bg-card bg-watermarked">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              We Specialize In
            </h2>
            {/* MODIFICATION: Image source is now the 'engine-supercharger-closeup.jpg' */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image Column */}
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
                <img
                  src={serviceCloseup}
                  alt="High performance supercharger"
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Content Column */}
              <div className="space-y-8">
                <Card className="p-6 border-2 border-primary/20 hover:border-primary/50 hover:shadow-glow-orange transition-all duration-300 hover:-translate-y-2">
                  <h3 className="text-xl font-bold mb-4 text-primary">
                    MerCruiser & Mercury Racing
                  </h3>
                  <p className="text-muted-foreground">
                    Expert diagnostics, service, and performance upgrades for
                    MerCruiser and Mercury Racing products. From routine
                    maintenance to race-ready builds.
                  </p>
                </Card>
                <Card className="p-6 border-2 border-secondary/20 hover:border-secondary/50 hover:shadow-glow-blue transition-all duration-300 hover:-translate-y-2">
                  <h3 className="text-xl font-bold mb-4 text-secondary">
                    Yamaha & Kawasaki Jet Skis
                  </h3>
                  <p className="text-muted-foreground">
                    Comprehensive 2-stroke and 4-stroke service, repair, and
                    performance upgrades for Yamaha and Kawasaki personal
                    watercraft.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - MODIFICATION: Added 'bg-watermarked' */}
      <section className="py-20 bg-background bg-watermarked">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Schedule Service?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contact us today for a quote or to discuss your marine service
            needs.
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
