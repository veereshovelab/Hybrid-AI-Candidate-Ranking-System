"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  ShieldQuestion, 
  TrendingUp, 
  Cpu, 
  Zap 
} from "lucide-react";
import { cn } from "../../utils/cn";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      description: "KPIs and Overview"
    },
    {
      name: "Candidate Rankings",
      path: "/rankings",
      icon: Users,
      description: "Interactive Talent Table"
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
      description: "Macro Talent Spreads"
    },
    {
      name: "Explainability",
      path: "/explainability",
      icon: ShieldQuestion,
      description: "Score Audit Logs"
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-border flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30">
      {/* Upper Section */}
      <div className="flex flex-col flex-1 py-6 px-4">
        {/* Brand/Logo */}
        <div className="flex items-center space-x-3 px-3 mb-8">
          <div className="bg-primary/20 p-2 rounded-lg text-primary border border-primary/30 flex items-center justify-center">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
              REDROB <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/20">AI</span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono">CANDIDATE DISCOVERY</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                  isActive
                    ? "bg-slate-800 text-slate-100 border border-slate-700/50 shadow-inner"
                    : "text-muted-foreground hover:bg-slate-800/40 hover:text-slate-200 hover:translate-x-[2px]"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-slate-300"
                )} />
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Pipeline Status Section */}
      <div className="p-4 border-t border-border/50 bg-slate-950/40 m-4 rounded-xl border">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-1.5">
          <Cpu className="h-3.5 w-3.5 text-success" />
          <span>Local Engine Status</span>
        </div>
        <div className="space-y-1 text-[11px] text-muted-foreground font-mono">
          <div className="flex justify-between">
            <span>Pool Size:</span>
            <span className="text-slate-300">100,000 records</span>
          </div>
          <div className="flex justify-between">
            <span>RAM Usage:</span>
            <span className="text-slate-300">264 MB (CPU)</span>
          </div>
          <div className="flex justify-between">
            <span>Audit Latency:</span>
            <span className="text-success font-semibold">78.4s total</span>
          </div>
        </div>
        <div className="mt-3 flex items-center space-x-1.5">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse inline-block"></span>
          <span className="text-[10px] uppercase font-bold text-success tracking-wider">Pipeline Ready</span>
        </div>
      </div>
    </aside>
  );
}
