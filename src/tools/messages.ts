import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

export function registerMessagesTools(server: McpServer, client: NksWebClient): void {
  server.registerTool(
    "nksweb_list_messages",
    {
      title: "List Messages",
      description: "List all messages",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      try {
        const data = await client.get("/messages");
        return {
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
      description: "Get a single message by ID",
      inputSchema: {
        id: z.number().describe("Message ID"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      try {
        const data = await client.get(`/messages/${args.id}`);
        return {
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
      description: "Mark a message as read or unread",
      inputSchema: {
        id: z.number().describe("Message ID"),
        read: z.boolean().optional().default(true).describe("Whether to mark the message as read (default: true)"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      try {
        const { id, read } = args;
        const data = await client.patch(`/messages/${id}/read`, { read });
        return {
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
      description: "Permanently delete a message by ID",
      inputSchema: {
        id: z.number().describe("Message ID to delete"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (args) => {
      try {
        const data = await client.delete(`/messages/${args.id}`);
        return {
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
