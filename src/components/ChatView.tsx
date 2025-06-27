
import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, FileText, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Separator } from "@/components/ui/separator";

const ChatView = () => {
  const { user } = useAuth();
  const {
    selectedWorkspace,
    chatMessages,
    sendMessage,
    isLoading,
    currentSessionDocuments,
    currentSessionType,
    messageSentWorkspaces,
  } = useWorkspace();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, selectedWorkspace?.ws_id]);

  // Handle typewriter effect for new messages
  useEffect(() => {
    if (!selectedWorkspace?.ws_id) return;

    const messages = chatMessages[selectedWorkspace.ws_id] || [];
    const lastMessage = messages[messages.length - 1];
    
    // Only apply typewriter effect if this workspace just sent a message
    if (lastMessage?.type === "bot" && messageSentWorkspaces[selectedWorkspace.ws_id]) {
      setTypingMessageId(lastMessage.id);
      
      // Clear the typing effect after animation completes
      const timer = setTimeout(() => {
        setTypingMessageId(null);
      }, lastMessage.content.length * 20 + 1000); // Adjust timing based on content length
      
      return () => clearTimeout(timer);
    }
  }, [chatMessages, selectedWorkspace?.ws_id, messageSentWorkspaces]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedWorkspace?.ws_id || isLoading) return;

    const messageText = input.trim();
    setInput("");

    try {
      await sendMessage(messageText, selectedWorkspace.ws_id, user?.user_id);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!selectedWorkspace) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-800 text-gray-400">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Workspace Selected</h3>
          <p>Please select a workspace to start chatting.</p>
        </div>
      </div>
    );
  }

  const messages = chatMessages[selectedWorkspace.ws_id] || [];
  const hasDocuments = currentSessionDocuments.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-gray-800 h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-gray-900">
        <h2 className="text-xl font-semibold text-white truncate">
          {selectedWorkspace.ws_name}
        </h2>
        {hasDocuments && (
          <div className="mt-2 flex flex-wrap gap-2">
            {currentSessionDocuments.map((doc, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300"
              >
                {doc.startsWith("http") ? (
                  <Globe className="h-3 w-3" />
                ) : (
                  <FileText className="h-3 w-3" />
                )}
                <span className="max-w-[200px] truncate">
                  {doc.startsWith("http") ? new URL(doc).hostname : doc}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
              <p>Ask questions about your uploaded documents or general queries.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === "user"
                    ? "bg-[#A259FF] text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                {message.type === "user" ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className={`markdown-content ${
                        typingMessageId === message.id ? "typewriter" : ""
                      }`}
                    >
                      {message.content}
                    </ReactMarkdown>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <p className="text-sm font-semibold mb-2">Sources:</p>
                        <ul className="text-sm space-y-1">
                          {message.sources.map((source, index) => (
                            <li key={index} className="text-gray-400">
                              {source}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-900">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="flex-1 min-h-[44px] max-h-32 resize-none bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus-visible:ring-[#A259FF]"
            disabled={isLoading}
            data-tour="ask-question"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-[#A259FF] hover:bg-[#A259FF]/90 text-white px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
