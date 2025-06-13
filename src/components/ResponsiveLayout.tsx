
import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  const isMobile = useIsMobile();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onOpenChange={setIsMobileSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sticky Header - fixed at top */}
        <header className="sticky top-0 z-20 border-b bg-gray-700/95 backdrop-blur-sm p-3 shadow-sm flex items-center justify-between min-h-[64px]">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger space - handled by MobileSidebar */}
            {isMobile && (
              <div className="ml-16 transition-all duration-200">
                <h1 className="text-xl sm:text-2xl font-semibold text-white truncate">
                  <span className="text-[#A259FF]">DataGpt</span>
                </h1>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Header content will be passed as children if needed */}
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden bg-background">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveLayout;
