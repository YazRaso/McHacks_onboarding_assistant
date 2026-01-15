import axios, { AxiosInstance } from "axios";
import * as vscode from "vscode";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  sources?: SourceFile[];
  context?: FileContext;
}

export interface SourceFile {
  path: string;
  lineStart?: number;
  lineEnd?: number;
  content?: string;
}

export interface FileContext {
  fileName: string;
  filePath: string;
  content: string;
  lineStart?: number;
  lineEnd?: number;
}

export class BackboardService {
  private apiClient: AxiosInstance;
  private clientId: string;

  constructor() {
    const config = vscode.workspace.getConfiguration("backboard");
    const apiUrl = config.get<string>(
      "apiUrl",
      "https://rob-production.up.railway.app/"
    );
    this.clientId = config.get<string>("clientId", "vscode_user");

    this.apiClient = axios.create({
      baseURL: apiUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async sendMessage(
    message: string,
    context?: FileContext
  ): Promise<ChatMessage> {
    if (message.includes("@source")) {
      return this.handleSourceRequest(message);
    }

    return this.queryBackend(message, context);
  }

  private async queryBackend(
    message: string,
    context?: FileContext
  ): Promise<ChatMessage> {
    try {
      // Build the query with optional context
      let fullMessage = message;
      if (context) {
        const contextInfo =
          context.lineStart && context.lineEnd
            ? `[Context from ${context.fileName} lines ${context.lineStart}-${context.lineEnd}]:\n${context.content}\n\n`
            : `[Context from ${context.fileName}]:\n${context.content}\n\n`;
        fullMessage = contextInfo + message;
      }

      // Call the backend /messages/query endpoint which returns (response, sources)
      const response = await this.apiClient.post("/messages/query", null, {
        params: {
          client_id: this.clientId,
          content: fullMessage,
        },
      });

      // Backend returns a tuple [response, sources]
      // Handle both array format [response, sources] and potential object format
      let content: string;
      let sources: string[] = [];
      
      if (Array.isArray(response.data)) {
        [content, sources] = response.data;
      } else if (typeof response.data === 'object' && response.data !== null) {
        content = response.data.response || response.data.content || JSON.stringify(response.data);
        sources = response.data.sources || [];
      } else {
        content = String(response.data || "No response received");
      }

      // Ensure content is not empty
      if (!content || content.trim() === "") {
        content = "I received your message but couldn't generate a response. Please try again.";
      }

      // Convert sources to SourceFile format if available
      const sourceFiles: SourceFile[] =
        sources?.map((source: string) => ({
          path: "memory",
          content: source,
        })) || [];

      return {
        role: "assistant",
        content: content,
        timestamp: Date.now(),
        sources: sourceFiles.length > 0 ? sourceFiles : undefined,
      };
    } catch (error: any) {
      console.error("Backend query failed:", error);

      // Return a helpful error message
      const errorMessage =
        error.response?.status === 404
          ? "Client not found. Please check your configuration in VS Code settings."
          : `Failed to connect to the backend. Make sure the server is running.\n\nError: ${error.message}`;

      return {
        role: "assistant",
        content: errorMessage,
        timestamp: Date.now(),
      };
    }
  }

  private async handleSourceRequest(message: string): Promise<ChatMessage> {
    // Strip @source from the message and query the backend
    const cleanedMessage = message.replace(/@source/gi, "").trim();
    
    // If there's no actual query after removing @source, ask for clarification
    if (!cleanedMessage) {
      return {
        role: "assistant",
        content: "Please specify what you'd like to find sources for. For example: `@source how does authentication work?`",
        timestamp: Date.now(),
      };
    }

    // Query the backend - sources will be included in the response
    return this.queryBackend(cleanedMessage);
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.apiClient.get("/");
      return response.data.status === "ok";
    } catch (error) {
      console.error("Connection check failed:", error);
      return false;
    }
  }
}
