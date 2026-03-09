import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

export function registerNewsTools(server: McpServer, client: NksWebClient): void {
  server.registerTool(
    "nksweb_list_news",
    {
      title: "List News",
      description: "List all news/announcement items for the current tenant. Returns id, name, url, published status, and timestamps. News items are time-based content like announcements, updates, or press releases.",
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
        const data = await client.get("/news");
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
    "nksweb_get_news_item",
    {
      title: "Get News Item",
      description: "Get full details of a news item by ID including HTML content and publication status.",
      inputSchema: {
        id: z.number().describe("News item ID"),
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
        const data = await client.get(`/news/${args.id}`);
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
    "nksweb_create_news",
    {
      title: "Create News Item",
      description: "Create a new news item. Requires name and url (slug). Set published=true to make it visible on the website immediately.",
      inputSchema: {
        name: z.string().describe("News headline/title"),
        url: z.string().describe("URL slug — must be unique (e.g. 'new-feature-released')"),
        content: z.string().optional().describe("Full news content in HTML"),
        published: z.boolean().optional().describe("true = visible on website, false = hidden draft"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (args) => {
      try {
        const data = await client.post("/news", args);
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
    "nksweb_update_news",
    {
      title: "Update News Item",
      description: "Update a news item. Only send fields to change. Use to publish/unpublish (published flag) or update content.",
      inputSchema: {
        id: z.number().describe("News item ID"),
        name: z.string().optional().describe("News headline/title"),
        url: z.string().optional().describe("URL slug — must be unique (e.g. 'new-feature-released')"),
        content: z.string().optional().describe("Full news content in HTML"),
        published: z.boolean().optional().describe("true = visible on website, false = hidden draft"),
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
        const { id, ...body } = args;
        const data = await client.put(`/news/${id}`, body);
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
    "nksweb_delete_news",
    {
      title: "Delete News Item",
      description: "Permanently delete a news item by ID. This action cannot be undone.",
      inputSchema: {
        id: z.number().describe("News item ID"),
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
        const data = await client.delete(`/news/${args.id}`);
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
