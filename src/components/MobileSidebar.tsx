
import React from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";

interface MobileSidebarProps {
  children?: React.ReactNode;
}

const MobileSidebar = ({ children }: MobileSidebarProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 h-11 w-11 bg-gray-800/90 hover:bg-gray-700/90 text-white backdrop-blur-sm border border-gray-600"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="p-0 w-80 bg-gray-900 border-gray-700"
        aria-describedby="mobile-sidebar-description"
      >
        <div id="mobile-sidebar-description" className="sr-only">
          Navigation menu with workspaces and chat history
        </div>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Menu</h2>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </div>
        <div className="h-full overflow-hidden">
          <Sidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
