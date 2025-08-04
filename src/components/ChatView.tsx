import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Send, Upload, FileText, Link, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";
import { ChatMessage, LLMSource } from "@/types/api";
import SessionIndicator from "./SessionIndicator";
import FreeTierModal from "./FreeTierModal";
import rehypeRaw from 'rehype-raw';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatViewProps {
  workspaceId: number;
  onUploadClick: () => void;
  onUrlClick: () => void;
}

const ChatView = ({
  workspaceId,
  onUploadClick,
  onUrlClick,
}: ChatViewProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFreeTierModalOpen, setIsFreeTierModalOpen] = useState(false);
  const { isAppValid } = useAuth();
  const isMobile = useIsMobile();
  const {
    sendMessage,
    chatMessages,
    loading,
    currentSessionDocuments,
    currentSessionType,
  } = useWorkspace();

  const [queries, setQueries] = useState<Record<number, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [workspaceLoadingStates, setWorkspaceLoadingStates] = useState<Record<number, boolean>>({});
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [typewriterMessageId, setTypewriterMessageId] = useState<string | null>(null);
  const [typewriterText, setTypewriterText] = useState<string>("");
  const [typewriterIndex, setTypewriterIndex] = useState<number>(0);
  const [messageSentWorkspaces, setMessageSentWorkspaces] = useState<Record<number, boolean>>({});

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasChatHistory = chatMessages[workspaceId]?.length > 0;
  const isPdfSession = currentSessionType === "pdf";
  const isUrlSession = currentSessionType === "url";
  const hasDocuments = currentSessionDocuments.length > 0;

  const filteredMessages = chatMessages[workspaceId] || [];
  const isWorkspaceLoading = workspaceLoadingStates[workspaceId] || false;
  const latestBotMessage = filteredMessages
    .filter(msg => msg.type === "bot")
    .slice(-1)[0];

  // Only trigger typewriter for new messages after sending a message
  useEffect(() => {
    if (latestBotMessage &&
      messageSentWorkspaces[workspaceId] &&
      !loading) {
      setTypewriterMessageId(latestBotMessage.id);
      setTypewriterText("");
      setTypewriterIndex(0);

      // Clear the flag after triggering typewriter
      setMessageSentWorkspaces(prev => ({
        ...prev,
        [workspaceId]: false
      }));
    }
  }, [latestBotMessage?.id, workspaceId, messageSentWorkspaces, loading]);

  useEffect(() => {
    if (typewriterMessageId === latestBotMessage?.id &&
      typewriterIndex < latestBotMessage.content.length) {
      const timer = setTimeout(() => {
        setTypewriterText(prev => prev + latestBotMessage.content[typewriterIndex]);
        setTypewriterIndex(prev => prev + 1);
      }, 2);
      return () => clearTimeout(timer);
    } else if (typewriterMessageId === latestBotMessage?.id &&
      typewriterIndex >= latestBotMessage.content.length) {
      setTimeout(() => {
        setTypewriterMessageId(null);
      }, 100);
    }
  }, [typewriterIndex, latestBotMessage?.content, typewriterMessageId]);

  useEffect(() => {
    if (!loading && workspaceLoadingStates[workspaceId]) {
      setWorkspaceLoadingStates(prev => ({
        ...prev,
        [workspaceId]: false
      }));
    }
  }, [loading, workspaceId, workspaceLoadingStates]);

  useEffect(() => {
    setTypewriterMessageId(null);
    setTypewriterText("");
    setTypewriterIndex(0);
    // Clear message sent flag when switching workspaces
    setMessageSentWorkspaces(prev => ({
      ...prev,
      [workspaceId]: false
    }));
  }, [workspaceId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }, 100);
    return () => clearTimeout(timeout);
  }, [workspaceId, chatMessages]);

  const autoResize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const maxHeight = isMobile ? 120 : 192;
      const newHeight = Math.min(inputRef.current.scrollHeight, maxHeight);
      inputRef.current.style.height = newHeight + "px";
    }
  };

  useEffect(() => {
    autoResize();
  }, [queries[workspaceId], isMobile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setQueries((prev) => ({
      ...prev,
      [workspaceId]: value,
    }));
  };

  const checkFreeTierAccess = (): boolean => {
    if (!isAppValid) {
      setIsFreeTierModalOpen(true);
      return false;
    }
    return true;
  };

  const handleSendMessage = async () => {
    if (!checkFreeTierAccess()) return;
    const currentQuery = queries[workspaceId] || "";
    if (!currentQuery.trim()) return;
    if (!hasDocuments && !hasChatHistory) {
      toast.warning(
        "Please upload a PDF or scrape a URL before sending a message."
      );
      return;
    }

    // Set flag that a message was sent for this workspace
    setMessageSentWorkspaces(prev => ({
      ...prev,
      [workspaceId]: true
    }));

    setWorkspaceLoadingStates(prev => ({
      ...prev,
      [workspaceId]: true
    }));

    setQueries((prev) => ({ ...prev, [workspaceId]: "" }));

    try {
      await sendMessage(workspaceId, currentQuery);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
      setQueries((prev) => ({ ...prev, [workspaceId]: currentQuery }));
      // Clear the flag if message failed
      setMessageSentWorkspaces(prev => ({
        ...prev,
        [workspaceId]: false
      }));
    } finally {
      setWorkspaceLoadingStates(prev => ({
        ...prev,
        [workspaceId]: false
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSources = (messageId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const renderSources = (
    sources: LLMSource[] | undefined,
    messageId: string
  ) => {
    if (!sources || sources.length === 0) return null;
    const isExpanded = expandedSources[messageId] || false;

    return (
      <div className="mt-2">
        <button
          onClick={() => toggleSources(messageId)}
          className="text-sm text-gray-500 hover:text-gray-300 flex items-center min-h-[44px] px-2 py-1 rounded"
          aria-label={isExpanded ? "Hide Citations" : "Show Citations"}
        >
          <span>{isExpanded ? "Hide Citations" : "Show Citations"}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {isExpanded && (
          <div className="mt-2 space-y-1 p-3 border border-gray-600 rounded-md bg-gray-800/50">
            {sources.map((src) => (
              <div key={src.source_id} className="mb-2 last:mb-0">
                <div className="flex items-center text-blue-400">
                  {src.file.startsWith("http") ? (
                    <Link className="h-4 w-4 mr-1 flex-shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium break-words">
                    {src.file} {src.page && `(page ${src.page})`}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1 pl-5 break-words">{src.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleUploadClick = () => {
    if (checkFreeTierAccess()) onUploadClick();
  };
  const handleUrlClick = () => {
    if (checkFreeTierAccess()) onUrlClick();
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 relative">
      {/* Chat messages with proper mobile spacing - scrollable area */}
      <div className="flex-grow overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className={`max-w-none ${isMobile ? '' : 'max-w-6xl mx-auto'} w-full`}>
          {hasChatHistory ? (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-4 sm:mb-6 ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative ${msg.type === "user"
                      ? "inline-block max-w-[80%] bg-gradient-to-br from-purple-500 to-indigo-600 hover:bg-[#A259FF]/90 text-white ml-4 sm:ml-12"
                      : "w-full sm:max-w-4xl bg-gray-800 text-white mr-4 sm:mr-12"
                    } px-4 sm:px-5 py-3 sm:py-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-[0_-3px_6px_rgba(0,0,0,0.1),0_3px_6px_rgba(0,0,0,0.1),-3px_0_6px_rgba(0,0,0,0.1),3px_0_6px_rgba(0,0,0,0.1)]`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-[#2964AA] underline hover:opacity-80 transition"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto">
                          <table
                            className="min-w-full border-separate border-spacing-y-1 rounded-lg overflow-hidden shadow-md text-xs md:text-sm"
                            {...props}
                          />
                        </div>
                      ),
                      thead: ({ node, ...props }) => (
                        <thead className="bg-blue-700 text-white border-b border-blue-400" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th
                          className="px-2 md:px-4 py-1 md:py-2 text-left border-b border-blue-400 text-xs md:text-sm"
                          {...props}
                        />
                      ),
                      tbody: ({ node, ...props }) => <tbody {...props} />,
                      tr: ({ node, ...props }) => (
                        <tr className="bg-gray-800 hover:bg-gray-700 border-b border-gray-700" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td
                          className="px-2 md:px-4 py-1 md:py-2 align-top border-b border-gray-700 text-xs md:text-sm"
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc list-inside space-y-1 pl-4" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal list-inside space-y-1 pl-4" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="mb-1 leading-relaxed" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-2 leading-relaxed text-gray-300" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-blue-600 pl-4 italic text-gray-400 my-4" {...props} />
                      )
                    }
                    }
                  >
                    {/* {msg.type === "bot" && typewriterMessageId === msg.id
                      ? typewriterText
                      : msg.content
                    } */}
                    {msg.content}
                  </ReactMarkdown>

                  {msg.type === "bot" && (
                    <>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          toast.success("Response copied");
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center rounded"
                        title="Copy response"
                        aria-label="Copy response"
                      >
                        <ClipboardCopy className="h-4 w-4" />
                      </button>
                      {renderSources(msg.sources, msg.id)}
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
              <FileText className="h-12 sm:h-16 w-12 sm:w-16 mb-4 text-gray-500" />
              <h2 className="text-xl sm:text-2xl font-semibold text-center">Start a conversation</h2>
              <p className="text-sm sm:text-base text-center mt-2 max-w-md">
                Upload a PDF or add a URL to begin chatting with your documents
              </p>
            </div>
          )}

          {isWorkspaceLoading && (
            <div className="flex justify-start mb-4 sm:mb-6">
              <div className="bg-gray-800 text-white px-4 sm:px-5 py-3 rounded-xl animate-pulse flex gap-2 mr-4 sm:mr-12">
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-gray-600 mb-2 p-2 w-[80%] mx-auto flex flex-col gap-2 rounded-xl">
        <div className="relative">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="Ask anything related to the uploaded files or URLs."
            value={queries[workspaceId] || ""}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            data-tour="ask-question"
            className="w-full resize-none bg-transparent text-gray-100 border-none focus:outline-none focus:ring-0 rounded-xl px-3 py-2 min-h-[44px] text-base placeholder:text-gray-400 overflow-y-auto scroll-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            style={{ maxHeight: isMobile ? '120px' : '192px' }}
            aria-label="Chat message input"
          />
        </div>

        {/* Buttons with mobile-optimized layout */}
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-2 text-xs sm:text-sm bg-gray-800 text-white hover:bg-gray-700 rounded-md min-h-[44px] transition-colors"
              aria-label="View session information"
              data-tour="session-info"
            >
              Session info
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUploadClick}
              className="hover:bg-gray-700 text-gray-300 min-h-[44px] min-w-[44px] transition-colors"
              aria-label="Upload PDF files"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUrlClick}
              className="hover:bg-gray-700 text-gray-300 min-h-[44px] min-w-[44px] transition-colors"
              aria-label="Add URL"
            >
              <Link className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="default"
            onClick={handleSendMessage}
            disabled={isWorkspaceLoading}
            className="bg-[#A259FF] hover:bg-[#A259FF]/90 text-white rounded-md min-h-[44px] min-w-[44px] shadow-sm flex items-center justify-center transition-all duration-200 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Session Modal with mobile responsiveness */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className={`${isMobile ? 'mx-4 max-w-[calc(100vw-2rem)]' : 'sm:max-w-md'} bg-gray-900 text-white`}>
          <DialogHeader>
            <DialogTitle>Current Session</DialogTitle>
          </DialogHeader>

          <SessionIndicator
            isUrlSession={isUrlSession}
            isPdfSession={isPdfSession}
            getScrapedWebsite={() => ""}
            currentSessionDocuments={currentSessionDocuments}
          />

          <DialogFooter>
            <Button
              onClick={() => setIsModalOpen(false)}
              className="min-h-[44px] transition-colors"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FreeTierModal
        isOpen={isFreeTierModalOpen}
        onClose={() => setIsFreeTierModalOpen(false)}
      />
    </div>
  );
};

export default ChatView;