import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

interface Message {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  isRead?: boolean;
  [key: string]: unknown;
}

const messageOutput = {
  id: z.number(),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
  isRead: z.boolean().optional(),
};

const messageListOutput = {
  items: z.array(z.object(messageOutput).passthrough()).describe("Messages matching the query"),
};

const deleteResultOutput = {
  deleted: z.boolean().optional(),
  status: z.string().optional(),
  message: z.string().optional(),
};

export function registerMessagesTools(server: McpServer, client: NksWebClient): void {
  server.registerTool(
    "nksweb_list_messages",
    {
      title: "List Messages",
      description: "List contact form submissions received from website visitors. Returns id, name, email, phone, subject, message body, isRead flag, and timestamps. Messages are sorted newest first. Use to monitor incoming inquiries.",
      inputSchema: {
        page: z.number().optional().default(1).describe("Page number (default: 1)"),
        limit: z.number().optional().default(50).describe("Items per page (default: 50)"),
      },
      outputSchema: messageListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Listing messages",
        "openai/toolInvocation/invoked": "Messages listed",
      },
    },
    async (args) => {
      try {
        const data = await client.get<Message[]>("/messages", { page: args.page, limit: args.limit });
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
    "nksweb_get_message",
    {
      title: "Get Message",
      description: "Get full details of a contact message including sender name, email, phone, subject, message body, IP address, read status, and timestamps.",
      inputSchema: {
        id: z.number().describe("Message ID"),
      },
      outputSchema: messageOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Loading message",
        "openai/toolInvocation/invoked": "Message loaded",
      },
    },
    async (args) => {
      try {
        const data = await client.get<Message>(`/messages/${args.id}`);
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
    "nksweb_mark_message_read",
    {
      title: "Mark Message Read",
      description: "Mark a contact message as read or unread. Defaults to marking as read. Use to track which messages have been reviewed by an admin.",
      inputSchema: {
        id: z.number().describe("Message ID"),
        read: z.boolean().optional().default(true).describe("true = mark as read (default), false = mark as unread"),
      },
      outputSchema: messageOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Marking message",
        "openai/toolInvocation/invoked": "Message marked",
      },
    },
    async (args) => {
      try {
        const { id, read } = args;
        const data = await client.patch<Message>(`/messages/${id}/read`, { read });
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
    "nksweb_delete_message",
    {
      title: "Delete Message",
      description: "Permanently delete a contact message. Cannot be undone.",
      inputSchema: {
        id: z.number().describe("Message ID"),
      },
      outputSchema: deleteResultOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Deleting message",
        "openai/toolInvocation/invoked": "Message deleted",
      },
    },
    async (args) => {
      try {
        const data = await client.delete<unknown>(`/messages/${args.id}`);
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
