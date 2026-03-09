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
      description: "Get a list of all articles in the NKS Web site",
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
        const data = await client.get<Article[]>("/articles");
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
      description: "Get a single article by its ID",
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
      description: "Create a new article in the NKS Web site",
      inputSchema: {
        name: z.string().describe("Article title"),
        url: z.string().describe("Article URL slug"),
        descriptionShort: z.string().optional().describe("Short teaser / excerpt"),
        description: z.string().optional().describe("Full article HTML content"),
        status: z.union([z.literal(0), z.literal(1)]).optional().describe("Article status: 0 = draft, 1 = published"),
        metaTitle: z.string().optional().describe("SEO meta title"),
        metaDescription: z.string().optional().describe("SEO meta description"),
        lang: z.string().optional().describe("Language code, e.g. 'cs' or 'en'"),
        categoryIds: z.array(z.number()).optional().describe("Array of category IDs to assign the article to"),
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
      description: "Update an existing article by its ID",
      inputSchema: {
        id: z.number().describe("Article ID"),
        name: z.string().optional().describe("Article title"),
        url: z.string().optional().describe("Article URL slug"),
        descriptionShort: z.string().optional().describe("Short teaser / excerpt"),
        description: z.string().optional().describe("Full article HTML content"),
        status: z.union([z.literal(0), z.literal(1)]).optional().describe("Article status: 0 = draft, 1 = published"),
        metaTitle: z.string().optional().describe("SEO meta title"),
        metaDescription: z.string().optional().describe("SEO meta description"),
        lang: z.string().optional().describe("Language code, e.g. 'cs' or 'en'"),
        categoryIds: z.array(z.number()).optional().describe("Array of category IDs to assign the article to"),
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
      description: "Permanently delete an article by its ID",
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
