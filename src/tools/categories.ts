import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

interface Category {
  id: number;
  title: string;
  description?: string;
  parentId?: number;
  [key: string]: unknown;
}

export function registerCategoriesTools(
  server: McpServer,
  client: NksWebClient
): void {
  server.registerTool(
    "nksweb_list_categories",
    {
      title: "List Categories",
      description: "Get a list of all article categories in the NKS Web site",
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
        const data = await client.get<Category[]>("/categories");
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
    "nksweb_get_category",
    {
      title: "Get Category",
      description: "Get a single article category by its ID",
      inputSchema: {
        id: z.number().describe("Category ID"),
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
        const data = await client.get<Category>(`/categories/${args.id}`);
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
    "nksweb_create_category",
    {
      title: "Create Category",
      description: "Create a new article category in the NKS Web site",
      inputSchema: {
        title: z.string().describe("Category title"),
        description: z.string().optional().describe("Category description"),
        parentId: z.number().optional().describe("Parent category ID for nested categories"),
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
        const data = await client.post<Category>("/categories", args);
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
    "nksweb_update_category",
    {
      title: "Update Category",
      description: "Update an existing article category by its ID",
      inputSchema: {
        id: z.number().describe("Category ID"),
        title: z.string().optional().describe("Category title"),
        description: z.string().optional().describe("Category description"),
        parentId: z.number().optional().describe("Parent category ID for nested categories"),
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
        const data = await client.put<Category>(`/categories/${id}`, body);
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
    "nksweb_delete_category",
    {
      title: "Delete Category",
      description: "Permanently delete an article category by its ID",
      inputSchema: {
        id: z.number().describe("Category ID"),
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
        const data = await client.delete<unknown>(`/categories/${args.id}`);
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
