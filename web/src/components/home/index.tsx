import React from "react";
import { HeroSection } from "./hero";

export { HeroSection };

export function HomeView() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background text-foreground antialiased selection:bg-foreground selection:text-background">
      <HeroSection />
    </div>
  );
}

export default HomeView;
