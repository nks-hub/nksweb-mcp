import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

interface Redirect {
  id: number;
  oldUrl: string;
  newUrl: string;
  statusCode?: number;
  active?: boolean;
  hitCount?: number;
  note?: string;
  [key: string]: unknown;
}

const redirectOutput = {
  id: z.number(),
  oldUrl: z.string(),
  newUrl: z.string(),
  statusCode: z.number().optional(),
  active: z.boolean().optional(),
  hitCount: z.number().optional(),
  note: z.string().optional(),
};

const redirectListOutput = {
  items: z.array(z.object(redirectOutput).passthrough()).describe("Redirects matching the query"),
};

const deleteResultOutput = {
  deleted: z.boolean().optional(),
  status: z.string().optional(),
  message: z.string().optional(),
};

export function registerRedirectsTools(server: McpServer, client: NksWebClient): void {
  server.registerTool(
    "nksweb_list_redirects",
    {
      title: "List Redirects",
      description: "List URL redirect rules for the current tenant. Returns oldUrl, newUrl, statusCode, active flag, hitCount, and timestamps. Redirects handle moved/renamed pages to prevent broken links and preserve SEO.",
      inputSchema: {
        page: z.number().optional().default(1).describe("Page number (default: 1)"),
        limit: z.number().optional().default(50).describe("Items per page (default: 50)"),
      },
      outputSchema: redirectListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Listing redirects",
        "openai/toolInvocation/invoked": "Redirects listed",
      },
    },
    async (args) => {
      try {
        const data = await client.get<Redirect[]>("/redirects", { page: args.page, limit: args.limit });
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
    "nksweb_get_redirect",
    {
      title: "Get Redirect",
      description: "Get redirect rule details including hit count (how many times it was triggered) and last hit timestamp.",
      inputSchema: {
        id: z.number().describe("Redirect ID"),
      },
      outputSchema: redirectOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Loading redirect",
        "openai/toolInvocation/invoked": "Redirect loaded",
      },
    },
    async (args) => {
      try {
        const data = await client.get<Redirect>(`/redirects/${args.id}`);
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
    "nksweb_create_redirect",
    {
      title: "Create Redirect",
      description: "Create a URL redirect rule. When a visitor hits oldUrl, they are redirected to newUrl with the specified HTTP status code. Use 301 for permanent moves (SEO-friendly), 302 for temporary, 307 for temporary with method preservation.",
      inputSchema: {
        oldUrl: z.string().describe("Source URL path to redirect from (without leading slash, e.g. 'old-page')"),
        newUrl: z.string().describe("Target URL to redirect to (e.g. '/new-page' or full URL)"),
        statusCode: z.number().optional().default(301).describe("HTTP redirect code: 301=permanent, 302=temporary, 307=temporary-preserve-method (default: 301)"),
        active: z.boolean().optional().default(true).describe("true = redirect is active, false = disabled (default: true)"),
        note: z.string().optional().describe("Internal admin note about why this redirect exists"),
      },
      outputSchema: redirectOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Creating redirect",
        "openai/toolInvocation/invoked": "Redirect created",
      },
    },
    async (args) => {
      try {
        const data = await client.post<Redirect>("/redirects", args);
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
    "nksweb_update_redirect",
    {
      title: "Update Redirect",
      description: "Update a redirect rule. Use to change target URL, switch status code, enable/disable, or update notes.",
      inputSchema: {
        id: z.number().describe("Redirect ID"),
        oldUrl: z.string().optional().describe("Source URL path to redirect from (without leading slash, e.g. 'old-page')"),
        newUrl: z.string().optional().describe("Target URL to redirect to (e.g. '/new-page' or full URL)"),
        statusCode: z.number().optional().describe("HTTP redirect code: 301=permanent, 302=temporary, 307=temporary-preserve-method (default: 301)"),
        active: z.boolean().optional().describe("true = redirect is active, false = disabled (default: true)"),
        note: z.string().optional().describe("Internal admin note about why this redirect exists"),
      },
      outputSchema: redirectOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Updating redirect",
        "openai/toolInvocation/invoked": "Redirect updated",
      },
    },
    async (args) => {
      try {
        const { id, ...body } = args;
        const data = await client.put<Redirect>(`/redirects/${id}`, body);
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
    "nksweb_delete_redirect",
    {
      title: "Delete Redirect",
      description: "Delete a redirect rule. The old URL will return 404 after deletion.",
      inputSchema: {
        id: z.number().describe("Redirect ID to delete"),
      },
      outputSchema: deleteResultOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Deleting redirect",
        "openai/toolInvocation/invoked": "Redirect deleted",
      },
    },
    async (args) => {
      try {
        const data = await client.delete<unknown>(`/redirects/${args.id}`);
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
