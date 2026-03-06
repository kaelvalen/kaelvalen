"use client";

import CardNav, { CardNavItem } from "./CardNav";

const items: CardNavItem[] = [
  {
    label: "About",
    bgColor: "#0c0b09",
    textColor: "#f0ebe0",
    links: [
      { label: "Who I Am", href: "#about", ariaLabel: "About me" },
      { label: "Philosophy", href: "#about", ariaLabel: "My philosophy" },
    ],
  },
  {
    label: "Research",
    bgColor: "#131210",
    textColor: "#f0ebe0",
    links: [
      { label: "State-Space Models", href: "#research", ariaLabel: "State-space models research" },
      { label: "Hybrid Archs", href: "#research", ariaLabel: "Hybrid architectures" },
      { label: "Flash Attention", href: "#research", ariaLabel: "Flash Attention v2" },
    ],
  },
  {
    label: "Projects",
    bgColor: "#1a1815",
    textColor: "#f0ebe0",
    links: [
      { label: "Beyond Transformer", href: "#projects", ariaLabel: "Beyond Transformer project" },
      { label: "SentinelFS", href: "#projects", ariaLabel: "SentinelFS project" },
    ],
  },
  {
    label: "Stack",
    bgColor: "#1e1c18",
    textColor: "#f0ebe0",
    links: [
      { label: "ML Frameworks", href: "#stack", ariaLabel: "ML frameworks" },
      { label: "Languages", href: "#stack", ariaLabel: "Core languages" },
    ],
  },
];

export default function Navbar() {
  return <CardNav items={items} />;
}
