
import React, { useState, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { FileText } from "lucide-react";
import ChatView from "./ChatView";
import UploadModal from "./UploadModal";
import UrlModal from "./UrlModal";
import { useIsMobile } from "@/hooks/use-mobile";

const WorkspaceView = () => {
  const { selectedWorkspace, currentSessionType } = useWorkspace();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsUploadModalOpen(false);
    setIsUrlModalOpen(false);
  }, [selectedWorkspace?.ws_id]);

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleUrlClick = () => {
    setIsUrlModalOpen(true);
  };

  if (!selectedWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-900 to-gray-800 px-4">
        <div className={`p-6 sm:p-8 bg-gray-800 rounded-lg shadow-sm border border-gray-700 ${isMobile ? 'w-full max-w-sm' : 'max-w-md'} text-center`}>
          <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-[#A259FF] mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
            Welcome to DataGpt
          </h2>
          <p className="text-sm sm:text-base text-gray-300 mb-6">
            Select a workspace or create a new one to get started with your
            documents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-grow overflow-hidden">
        {selectedWorkspace.ws_id && (
          <ChatView
            workspaceId={selectedWorkspace.ws_id}
            onUploadClick={handleUploadClick}
            onUrlClick={handleUrlClick}
          />
        )}
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
      
      <UrlModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
      />
    </div>
  );
};

export default WorkspaceView;
