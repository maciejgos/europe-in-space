export const missionCategories = ["Earth observation", "Science", "Exploration", "Technology"] as const;

export const repository = "https://github.com/maciejgos/europe-in-space";
export const sections = [
  {
    slug: "missions",
    title: "Missions",
    icon: "rocket-launch",
    description: "Discover Europe’s space missions.",
    heading: "European space missions",
    summary:
      "From our home planet to the far reaches of the Solar System. Get to know the missions expanding our horizons.",
  },
  {
    slug: "satellites",
    title: "Satellites",
    icon: "planet",
    description: "Explore spacecraft around Earth.",
    heading: "A new perspective on Earth.",
    summary:
      "Follow European spacecraft and explore the science behind their orbits.",
  },
  {
    slug: "observatories",
    title: "Observatories",
    icon: "binoculars",
    description: "Look further into the universe.",
    heading: "Windows to the universe.",
    summary:
      "Discover the telescopes and observatories helping us see further, from Earth and from space.",
  },
  {
    slug: "imagery",
    title: "Imagery",
    icon: "image",
    description: "See space through European eyes.",
    heading: "A universe worth exploring.",
    summary:
      "A future collection of space and Earth imagery, with the story and source behind every image.",
  },
  {
    slug: "earth",
    title: "Earth",
    icon: "globe-hemisphere-west",
    description: "Understand our changing planet.",
    heading: "Our planet. A bigger picture.",
    summary:
      "Explore how European Earth observation helps us understand the place we call home.",
  },
] as const;
export const searchEntries = [
  ...sections.map((s) => ({
    title: s.title,
    description: s.description,
    href: `/${s.slug}/`,
    icon: s.icon,
  })),
  {
    title: "About the project",
    description: "Independent, open and built for curiosity.",
    href: "/about/",
    icon: "info",
  },
  {
    title: "Data sources",
    description: "Sources, attribution and data transparency.",
    href: "/data-sources/",
    icon: "stack",
  },
  {
    title: "Design system",
    description: "Foundations, components and responsive layouts.",
    href: "/design-system/",
    icon: "code",
  },
];
