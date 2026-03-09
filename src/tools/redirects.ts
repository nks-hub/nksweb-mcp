import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

export function registerRedirectsTools(server: McpServer, client: NksWebClient): void {
  server.registerTool(
    "nksweb_list_redirects",
    {
      title: "List Redirects",
      description: "List all URL redirect rules for the current tenant. Returns oldUrl, newUrl, statusCode, active flag, hitCount, and timestamps. Redirects handle moved/renamed pages to prevent broken links and preserve SEO.",
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
        const data = await client.get("/redirects");
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
    "nksweb_get_redirect",
    {
      title: "Get Redirect",
      description: "Get redirect rule details including hit count (how many times it was triggered) and last hit timestamp.",
      inputSchema: {
        id: z.number().describe("Redirect ID"),
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
        const data = await client.get(`/redirects/${args.id}`);
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
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (args) => {
      try {
        const data = await client.post("/redirects", args);
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
        const data = await client.put(`/redirects/${id}`, body);
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
    "nksweb_delete_redirect",
    {
      title: "Delete Redirect",
      description: "Delete a redirect rule. The old URL will return 404 after deletion.",
      inputSchema: {
        id: z.number().describe("Redirect ID to delete"),
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
        const data = await client.delete(`/redirects/${args.id}`);
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
