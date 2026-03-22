import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

interface Article {
  id: number;
  name: string;
  url: string;
  descriptionShort?: string;
  description?: string;
  status?: number;
  metaTitle?: string;
  metaDescription?: string;
  lang?: string;
  categoryIds?: number[];
  [key: string]: unknown;
}

export function registerArticlesTools(
  server: McpServer,
  client: NksWebClient
): void {
  server.registerTool(
    "nksweb_list_articles",
    {
      title: "List Articles",
      description: "List blog/news articles for the current tenant. Returns id, name, url, descriptionShort, status, lang, categoryIds, and timestamps. Use this to see existing content before creating new articles.",
      inputSchema: {
        page: z.number().optional().default(1).describe("Page number (default: 1)"),
        limit: z.number().optional().default(50).describe("Items per page (default: 50)"),
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
        const data = await client.get<Article[]>("/articles", { page: args.page, limit: args.limit });
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
    "nksweb_get_article",
    {
      title: "Get Article",
      description: "Get full article details including HTML content, categories, SEO metadata, and timestamps.",
      inputSchema: {
        id: z.number().describe("Article ID"),
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
        const data = await client.get<Article>(`/articles/${args.id}`);
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
    "nksweb_create_article",
    {
      title: "Create Article",
      description: "Create a new blog article. Requires name and url (slug). Use descriptionShort for listing excerpts and description for full HTML content. Link to categories via categoryIds array. Set status=1 to publish.",
      inputSchema: {
        name: z.string().describe("Article title"),
        url: z.string().describe("URL slug — must be unique, lowercase, no spaces (e.g. 'my-first-post')"),
        descriptionShort: z.string().optional().describe("Short excerpt shown in article listings and cards"),
        description: z.string().optional().describe("Full article content in HTML"),
        status: z.union([z.literal(0), z.literal(1)]).optional().describe("0 = draft/disabled, 1 = published/active"),
        metaTitle: z.string().optional().describe("SEO title tag (shown in browser tab and search results)"),
        metaDescription: z.string().optional().describe("SEO meta description (shown in search result snippets)"),
        lang: z.string().optional().describe("Language code ISO 639-1 (e.g. 'cs', 'en')"),
        categoryIds: z.array(z.number()).optional().describe("Array of category IDs to assign this article to"),
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
        const data = await client.post<Article>("/articles", args);
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
    "nksweb_update_article",
    {
      title: "Update Article",
      description: "Update an existing article. Only send fields to change — omitted fields keep their current values. Use to publish drafts, update content, or reassign categories.",
      inputSchema: {
        id: z.number().describe("Article ID"),
        name: z.string().optional().describe("Article title"),
        url: z.string().optional().describe("URL slug — must be unique, lowercase, no spaces (e.g. 'my-first-post')"),
        descriptionShort: z.string().optional().describe("Short excerpt shown in article listings and cards"),
        description: z.string().optional().describe("Full article content in HTML"),
        status: z.union([z.literal(0), z.literal(1)]).optional().describe("0 = draft/disabled, 1 = published/active"),
        metaTitle: z.string().optional().describe("SEO title tag (shown in browser tab and search results)"),
        metaDescription: z.string().optional().describe("SEO meta description (shown in search result snippets)"),
        lang: z.string().optional().describe("Language code ISO 639-1 (e.g. 'cs', 'en')"),
        categoryIds: z.array(z.number()).optional().describe("Array of category IDs to assign this article to"),
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
        const data = await client.put<Article>(`/articles/${id}`, body);
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
    "nksweb_delete_article",
    {
      title: "Delete Article",
      description: "Permanently delete an article. Soft-deleted — won't appear in listings but exists in database.",
      inputSchema: {
        id: z.number().describe("Article ID"),
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
        const data = await client.delete<unknown>(`/articles/${args.id}`);
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
