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

const categoryOutput = {
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  parentId: z.number().nullable().optional(),
};

const categoryListOutput = {
  items: z.array(z.object(categoryOutput).passthrough()).describe("Categories matching the query"),
};

const deleteResultOutput = {
  deleted: z.boolean().optional(),
  status: z.string().optional(),
  message: z.string().optional(),
};

export function registerCategoriesTools(
  server: McpServer,
  client: NksWebClient
): void {
  server.registerTool(
    "nksweb_list_categories",
    {
      title: "List Categories",
      description: "List article categories. Categories use a nested tree structure — root categories have parent=null, subcategories reference their parent's ID. Use to discover category hierarchy before assigning articles.",
      inputSchema: {
        page: z.number().optional().default(1).describe("Page number (default: 1)"),
        limit: z.number().optional().default(50).describe("Items per page (default: 50)"),
      },
      outputSchema: categoryListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Listing categories",
        "openai/toolInvocation/invoked": "Categories listed",
      },
    },
    async (args) => {
      try {
        const data = await client.get<Category[]>("/categories", { page: args.page, limit: args.limit });
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
    "nksweb_get_category",
    {
      title: "Get Category",
      description: "Get category details including title, description, and parent category reference.",
      inputSchema: {
        id: z.number().describe("Category ID"),
      },
      outputSchema: categoryOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Loading category",
        "openai/toolInvocation/invoked": "Category loaded",
      },
    },
    async (args) => {
      try {
        const data = await client.get<Category>(`/categories/${args.id}`);
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
    "nksweb_create_category",
    {
      title: "Create Category",
      description: "Create a new article category. Set parentId to nest under an existing category, or omit for a root-level category.",
      inputSchema: {
        title: z.string().describe("Category display name (max 64 chars)"),
        description: z.string().optional().describe("Category description text"),
        parentId: z.number().optional().describe("Parent category ID for nesting — omit or null for root category"),
      },
      outputSchema: categoryOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Creating category",
        "openai/toolInvocation/invoked": "Category created",
      },
    },
    async (args) => {
      try {
        const data = await client.post<Category>("/categories", args);
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
    "nksweb_update_category",
    {
      title: "Update Category",
      description: "Update a category's title, description, or parent. Moving a category (changing parentId) restructures the tree.",
      inputSchema: {
        id: z.number().describe("Category ID"),
        title: z.string().optional().describe("Category display name (max 64 chars)"),
        description: z.string().optional().describe("Category description text"),
        parentId: z.number().optional().describe("Parent category ID for nesting — omit or null for root category"),
      },
      outputSchema: categoryOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Updating category",
        "openai/toolInvocation/invoked": "Category updated",
      },
    },
    async (args) => {
      try {
        const { id, ...body } = args;
        const data = await client.put<Category>(`/categories/${id}`, body);
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
    "nksweb_delete_category",
    {
      title: "Delete Category",
      description: "Delete a category. Articles assigned to this category will lose the association.",
      inputSchema: {
        id: z.number().describe("Category ID"),
      },
      outputSchema: deleteResultOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Deleting category",
        "openai/toolInvocation/invoked": "Category deleted",
      },
    },
    async (args) => {
      try {
        const data = await client.delete<unknown>(`/categories/${args.id}`);
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
