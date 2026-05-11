import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

interface NewsItem {
  id: number;
  name: string;
  url: string;
  content?: string;
  published?: boolean;
  [key: string]: unknown;
}

const newsOutput = {
  id: z.number(),
  name: z.string(),
  url: z.string(),
  content: z.string().optional(),
  published: z.boolean().optional(),
};

const newsListOutput = {
  items: z.array(z.object(newsOutput).passthrough()).describe("News items matching the query"),
};

const deleteResultOutput = {
  deleted: z.boolean().optional(),
  status: z.string().optional(),
  message: z.string().optional(),
};

export function registerNewsTools(server: McpServer, client: NksWebClient): void {
  server.registerTool(
    "nksweb_list_news",
    {
      title: "List News",
      description: "List news/announcement items for the current tenant. Returns id, name, url, published status, and timestamps. News items are time-based content like announcements, updates, or press releases.",
      inputSchema: {
        page: z.number().optional().default(1).describe("Page number (default: 1)"),
        limit: z.number().optional().default(50).describe("Items per page (default: 50)"),
      },
      outputSchema: newsListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Listing news",
        "openai/toolInvocation/invoked": "News listed",
      },
    },
    async (args) => {
      try {
        const data = await client.get<NewsItem[]>("/news", { page: args.page, limit: args.limit });
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
    "nksweb_get_news_item",
    {
      title: "Get News Item",
      description: "Get full details of a news item by ID including HTML content and publication status.",
      inputSchema: {
        id: z.number().describe("News item ID"),
      },
      outputSchema: newsOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Loading news item",
        "openai/toolInvocation/invoked": "News item loaded",
      },
    },
    async (args) => {
      try {
        const data = await client.get<NewsItem>(`/news/${args.id}`);
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
      outputSchema: newsOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Creating news item",
        "openai/toolInvocation/invoked": "News item created",
      },
    },
    async (args) => {
      try {
        const data = await client.post<NewsItem>("/news", args);
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
      outputSchema: newsOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Updating news item",
        "openai/toolInvocation/invoked": "News item updated",
      },
    },
    async (args) => {
      try {
        const { id, ...body } = args;
        const data = await client.put<NewsItem>(`/news/${id}`, body);
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
    "nksweb_delete_news",
    {
      title: "Delete News Item",
      description: "Permanently delete a news item by ID. This action cannot be undone.",
      inputSchema: {
        id: z.number().describe("News item ID"),
      },
      outputSchema: deleteResultOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Deleting news item",
        "openai/toolInvocation/invoked": "News item deleted",
      },
    },
    async (args) => {
      try {
        const data = await client.delete<unknown>(`/news/${args.id}`);
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
