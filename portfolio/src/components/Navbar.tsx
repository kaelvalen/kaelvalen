"use client";

import CardNav, { CardNavItem } from "./CardNav";

const items: CardNavItem[] = [
  {
    label: "About",
    bgColor: "#0f0f0f",
    textColor: "#fafafa",
    links: [
      { label: "Who I Am", href: "#about", ariaLabel: "About me" },
      { label: "Philosophy", href: "#about", ariaLabel: "My philosophy" },
    ],
  },
  {
    label: "Research",
    bgColor: "#141414",
    textColor: "#fafafa",
    links: [
      { label: "State-Space Models", href: "#research", ariaLabel: "State-space models research" },
      { label: "Hybrid Archs", href: "#research", ariaLabel: "Hybrid architectures" },
      { label: "Flash Attention", href: "#research", ariaLabel: "Flash Attention v2" },
    ],
  },
  {
    label: "Projects",
    bgColor: "#1a1a1a",
    textColor: "#fafafa",
    links: [
      { label: "Beyond Transformer", href: "#projects", ariaLabel: "Beyond Transformer project" },
      { label: "SentinelFS", href: "#projects", ariaLabel: "SentinelFS project" },
    ],
  },
  {
    label: "Stack",
    bgColor: "#1e1e1e",
    textColor: "#fafafa",
    links: [
      { label: "ML Frameworks", href: "#stack", ariaLabel: "ML frameworks" },
      { label: "Languages", href: "#stack", ariaLabel: "Core languages" },
    ],
  },
];

export default function Navbar() {
  return <CardNav items={items} />;
}
