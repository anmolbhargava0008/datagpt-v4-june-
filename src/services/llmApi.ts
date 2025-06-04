import { LLMResponse } from "@/types/api";
import { v4 as uuidv4 } from "uuid";
import { 
  LLM_API_BASE_URL, 
  LLM_START_SESSION_ENDPOINT, 
  LLM_UPLOAD_PDF_ENDPOINT, 
  LLM_ASK_QUESTION_ENDPOINT,
  LLM_LIST_FILES_ENDPOINT,
  LLM_SCRAPE_URL_ENDPOINT
} from "@/constants/api";

export const llmApi = {
  startSession: async (): Promise<{ success: boolean; session_id?: string }> => {
    try {
      // This is a GET request
      const response = await fetch(`${LLM_API_BASE_URL}/start-session/`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to start session with LLM API");
      }

      const data = await response.json();
      return {
        success: true,
        session_id: data.session_id
      };
    } catch (error) {
      console.error("Error starting session with LLM API:", error);
      return { success: false };
    }
  },

  uploadDocument: async (file: File, sessionId: string): Promise<{ success: boolean; message?: string; chunks?: number }> => {
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("session_id", sessionId);

      const response = await fetch(LLM_UPLOAD_PDF_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document to LLM API");
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message,
        chunks: data.chunks
      };
    } catch (error) {
      console.error("Error uploading document to LLM API:", error);
      return { success: false };
    }
  },

  query: async (question: string, sessionId: string): Promise<LLMResponse> => {
    try {
      const response = await fetch(LLM_ASK_QUESTION_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          question: question
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to query LLM API");
      }

      const data = await response.json();
      return {
        answer: data.answer,
        sources: data.sources?.map((source: string, index: number) => {
          // Handle different types of sources (PDF vs URL)
          if (source.includes('page')) {
            // Parse source information from the string format for PDF
            const match = source.match(/Context \d+: (.+) page (\d+)/);
            const fileName = match ? match[1] : `unknown_${index}.pdf`;
            const pageNum = match ? parseInt(match[2]) : 1;
            
            return {
              source_id: uuidv4(),
              summary: source,
              file: fileName,
              page: pageNum,
            };
          } else {
            // Handle URL source format
            const urlMatch = source.match(/Context \d+: (.+)/);
            const url = urlMatch ? urlMatch[1] : source;
            
            return {
              source_id: uuidv4(),
              summary: source,
              file: url,
              page: undefined,
            };
          }
        }) || [],
      };
    } catch (error) {
      console.error("Error querying LLM API:", error);
      
      return {
        answer: `The server is currently down. Please contact your administrator for assistance.`,
        sources: [
          {
            source_id: uuidv4(),
            summary: "This is a mock summary of the document.",
            file: "sample_document.pdf",
            page: 5,
          },
        ],
      };
    }
  },

  listFiles: async (sessionId: string): Promise<{ success: boolean; files?: string[] }> => {
    try {
      const response = await fetch(`${LLM_LIST_FILES_ENDPOINT}${sessionId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch file list from LLM API");
      }

      const data = await response.json();
      
      // Handle both PDF files and scraped URLs in the response
      let files: string[] = [];
      
      if (data.files && Array.isArray(data.files)) {
        // Parse the files array
        files = data.files.map((file: string) => {
          // If the file is a scraped URL, return it directly
          if (file.startsWith('http://') || file.startsWith('https://')) {
            return file;
          }
          // Otherwise return the filename (PDF or other file type)
          return file;
        });
      }
      
      return {
        success: true,
        files: files
      };
    } catch (error) {
      console.error("Error fetching file list from LLM API:", error);
      return { success: false, files: [] };
    }
  },

  scrapeUrl: async (url: string, sessionId: string): Promise<{ success: boolean; message?: string; chunks?: number }> => {
    try {
      const response = await fetch(LLM_SCRAPE_URL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          url: url
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to scrape URL with LLM API");
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || "URL scraped successfully",
        chunks: data.chunks
      };
    } catch (error) {
      console.error("Error scraping URL with LLM API:", error);
      return { success: false };
    }
  }
};
