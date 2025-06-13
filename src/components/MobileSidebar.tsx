
import React from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";

interface MobileSidebarProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MobileSidebar = ({ children, isOpen, onOpenChange }: MobileSidebarProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
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
        className="p-0 w-72 bg-gray-900 border-gray-700"
        aria-describedby="mobile-sidebar-description"
      >
        <div className="h-full overflow-hidden">
          <Sidebar onWorkspaceSelect={() => onOpenChange?.(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
