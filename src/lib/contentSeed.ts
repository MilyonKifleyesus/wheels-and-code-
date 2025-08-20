import supabase from "../utils/supabase";

export type DBContentSection = {
  section_type:
    | "hero"
    | "services"
    | "inventory"
    | "testimonials"
    | "contact"
    | "about"
    | "finance"
    | "trust"
    | "promo"
    | "map";
  title: string;
  visible: boolean;
  sort_order: number;
  content: Record<string, unknown>;
};

export const defaultContentSeed: DBContentSection[] = [
  {
    section_type: "hero",
    title: "Hero Section",
    visible: true,
    sort_order: 1,
    content: {
      heading: "PRECISION PERFORMANCE PERFECTION",
      subheading: "Where automotive excellence meets cutting-edge service",
      description:
        "Experience the pinnacle of automotive luxury and performance",
      buttonText: "BROWSE CARS",
      buttonLink: "/inventory",
      backgroundColor: "#0B0B0C",
      textColor: "#FFFFFF",
      accentColor: "#D7FF00",
    },
  },
  {
    section_type: "services",
    title: "Services Section",
    visible: true,
    sort_order: 2,
    content: {
      heading: "PRECISION SERVICE",
      description:
        "Expert automotive service with state-of-the-art equipment and certified technicians",
      backgroundColor: "#0B0B0C",
      textColor: "#FFFFFF",
      accentColor: "#D7FF00",
    },
  },
  {
    section_type: "inventory",
    title: "Inventory Section",
    visible: true,
    sort_order: 3,
    content: {
      heading: "NEW ARRIVALS",
      description: "Latest additions to our premium collection",
      backgroundColor: "#141518",
      textColor: "#FFFFFF",
      accentColor: "#D7FF00",
    },
  },
  {
    section_type: "trust",
    title: "Trust Section",
    visible: true,
    sort_order: 4,
    content: {
      heading: "TRUSTED BY THOUSANDS",
      description:
        "Join thousands of satisfied customers who trust us with their automotive needs",
      backgroundColor: "#0B0B0C",
      textColor: "#FFFFFF",
      accentColor: "#D7FF00",
    },
  },
  {
    section_type: "finance",
    title: "Finance Section",
    visible: true,
    sort_order: 5,
    content: {
      heading: "FINANCE OPTIONS",
      description:
        "Get pre-qualified in minutes with competitive CAD rates and flexible terms",
      backgroundColor: "#1A1B1E",
      textColor: "#FFFFFF",
      accentColor: "#D7FF00",
    },
  },
  {
    section_type: "promo",
    title: "Promo Section",
    visible: true,
    sort_order: 6,
    content: {
      heading: "PERFORMANCE SERVICE SPECIAL",
      description:
        "Complete performance package including diagnostics, tune-up, and optimization",
      backgroundColor: "#0B0B0C",
      textColor: "#FFFFFF",
      accentColor: "#D7FF00",
    },
  },
  {
    section_type: "map",
    title: "Map Section",
    visible: true,
    sort_order: 7,
    content: {
      heading: "VISIT US",
      description:
        "Experience our state-of-the-art facility and meet our expert team",
      backgroundColor: "#1A1B1E",
      textColor: "#FFFFFF",
      accentColor: "#D7FF00",
    },
  },
];

export async function seedDatabase() {
  if (!supabase) {
    return { success: false, message: "Supabase not configured" };
  }

  try {
    const { count, error: countError } = await supabase
      .from("content_sections")
      .select("id", { count: "exact", head: true });

    if (countError) {
      return { success: false, message: countError.message };
    }

    if (typeof count === "number" && count > 0) {
      return {
        success: true,
        alreadySeeded: true,
        message: "Content already seeded",
      };
    }

    const { error: insertError } = await supabase
      .from("content_sections")
      .insert(defaultContentSeed);

    if (insertError) {
      return { success: false, message: insertError.message };
    }

    return {
      success: true,
      alreadySeeded: false,
      message: "Seeded default content",
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
