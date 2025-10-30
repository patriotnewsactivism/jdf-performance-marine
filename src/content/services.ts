export type ServiceCategory = {
  category: string;
  items: string[];
};

export const popularServices: string[] = [
  "Custom Rigging",
  "Race Engine Building",
  "Outdrive Rebuilds",
  "Mercury / MerCruiser Diagnostics",
  "Winterizing & Shrinkwrap",
  "Water Testing",
];

export const servicesCatalog: ServiceCategory[] = [
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
