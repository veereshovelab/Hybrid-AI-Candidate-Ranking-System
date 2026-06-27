import "./globals.css";
import { Sidebar } from "../components/layout/sidebar";
import { Topbar } from "../components/layout/topbar";
import { CandidatesProvider } from "../hooks/use-candidates";

export const metadata = {
  title: "Hybrid AI Candidate Ranking System",
  description: "Enterprise-grade Hybrid AI Candidate Discovery & Ranking SaaS platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="h-full bg-background text-foreground font-sans overflow-hidden">
        <CandidatesProvider>
          <div className="flex w-full h-screen overflow-hidden">
            {/* Left navigation sidebar */}
            <Sidebar />
            
            {/* Main content viewport */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-y-auto bg-slate-950/30 p-8">
                {children}
              </main>
            </div>
          </div>
        </CandidatesProvider>
      </body>
    </html>
  );
}
