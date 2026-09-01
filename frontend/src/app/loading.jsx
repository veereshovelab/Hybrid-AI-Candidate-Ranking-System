import React from "react";
import { AnimatedLoader } from "@/components/ui/animated-loader";

export default function Loading() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <AnimatedLoader 
        message="Analyzing Candidate Embeddings & AI Scores..." 
        subtext="Hybrid AI Candidate Ranking System"
        showSkeleton={true}
      />
    </div>
  );
}
