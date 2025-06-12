
import React from "react";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "@/components/UserMenu";
import ResponsiveLayout from "@/components/ResponsiveLayout";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <WorkspaceProvider>
      <ResponsiveLayout>
        <div className="flex flex-col h-full">
          {/* Header content moved to ResponsiveLayout */}
          <div className="absolute top-3 right-3 z-30">
            {isAuthenticated && <UserMenu />}
          </div>
          
          {/* Main content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </ResponsiveLayout>
    </WorkspaceProvider>
  );
};

export default MainLayout;
