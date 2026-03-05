"use client";

import CardNav, { CardNavItem } from "./CardNav";

const items: CardNavItem[] = [
  {
    label: "About",
    bgColor: "#0D0716",
    textColor: "#e2e2ef",
    links: [
      { label: "Who I Am", href: "#about", ariaLabel: "About me" },
      { label: "Philosophy", href: "#about", ariaLabel: "My philosophy" },
    ],
  },
  {
    label: "Research",
    bgColor: "#130d22",
    textColor: "#e2e2ef",
    links: [
      { label: "State-Space Models", href: "#research", ariaLabel: "State-space models research" },
      { label: "Hybrid Archs", href: "#research", ariaLabel: "Hybrid architectures" },
      { label: "Flash Attention", href: "#research", ariaLabel: "Flash Attention v2" },
    ],
  },
  {
    label: "Projects",
    bgColor: "#170d27",
    textColor: "#e2e2ef",
    links: [
      { label: "Beyond Transformer", href: "#projects", ariaLabel: "Beyond Transformer project" },
      { label: "SentinelFS", href: "#projects", ariaLabel: "SentinelFS project" },
    ],
  },
  {
    label: "Stack",
    bgColor: "#1a1030",
    textColor: "#e2e2ef",
    links: [
      { label: "ML Frameworks", href: "#stack", ariaLabel: "ML frameworks" },
      { label: "Languages", href: "#stack", ariaLabel: "Core languages" },
    ],
  },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <CardNav items={items} />
      </div>
    </header>
  );
}
