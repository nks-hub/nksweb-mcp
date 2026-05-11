import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

interface FileItem {
  id: number;
  name: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  [key: string]: unknown;
}

const fileOutput = {
  id: z.number(),
  name: z.string(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  fileSize: z.number().optional(),
};

const fileListOutput = {
  items: z.array(z.object(fileOutput).passthrough()).describe("Files matching the query"),
};

const deleteResultOutput = {
  deleted: z.boolean().optional(),
  status: z.string().optional(),
  message: z.string().optional(),
};

export function registerFilesTools(server: McpServer, client: NksWebClient): void {
  server.registerTool(
    "nksweb_list_files",
    {
      title: "List Files",
      description: "List uploaded files/media assets. Returns id, name, fileName (stored name), mimeType, fileSize, and timestamps. Files are images, documents, or other media uploaded through the CMS admin.",
      inputSchema: {
        page: z.number().optional().default(1).describe("Page number (default: 1)"),
        limit: z.number().optional().default(50).describe("Items per page (default: 50)"),
      },
      outputSchema: fileListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Listing files",
        "openai/toolInvocation/invoked": "Files listed",
      },
    },
    async (args) => {
      try {
        const data = await client.get<FileItem[]>("/files", { page: args.page, limit: args.limit });
        const structured = { items: Array.isArray(data) ? data : [] };
        return {
          structuredContent: structured as unknown as Record<string, unknown>,
          content: [{ type: "text" as const, text: truncateResponse(data) }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "nksweb_get_file",
    {
      title: "Get File",
      description: "Get file metadata by ID including original name, stored filename, MIME type, file size in bytes, and upload timestamp.",
      inputSchema: {
        id: z.number().describe("File ID"),
      },
      outputSchema: fileOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Loading file",
        "openai/toolInvocation/invoked": "File loaded",
      },
    },
    async (args) => {
      try {
        const data = await client.get<FileItem>(`/files/${args.id}`);
        return {
          structuredContent: data as unknown as Record<string, unknown>,
          content: [{ type: "text" as const, text: truncateResponse(data) }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "nksweb_delete_file",
    {
      title: "Delete File",
      description: "Permanently delete a file and its physical storage. This removes the file from disk — any pages or articles referencing it will have broken links. Cannot be undone.",
      inputSchema: {
        id: z.number().describe("File ID"),
      },
      outputSchema: deleteResultOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Deleting file",
        "openai/toolInvocation/invoked": "File deleted",
      },
    },
    async (args) => {
      try {
        const data = await client.delete<unknown>(`/files/${args.id}`);
        return {
          structuredContent: (data && typeof data === "object" ? data : { deleted: true }) as Record<string, unknown>,
          content: [{ type: "text" as const, text: truncateResponse(data) }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
