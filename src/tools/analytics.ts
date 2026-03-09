import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

export function registerAnalyticsTools(server: McpServer, client: NksWebClient): void {
  server.registerTool(
    "nksweb_analytics_overview",
    {
      title: "Analytics Overview",
      description: "Get aggregated analytics overview (visits, pageviews, unique visitors, etc.) with optional date range filter",
      inputSchema: {
        startDate: z.string().optional().describe("Start date for the analytics range (e.g. 2024-01-01)"),
        endDate: z.string().optional().describe("End date for the analytics range (e.g. 2024-01-31)"),
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
        const params: Record<string, string> = {};
        if (args.startDate) params.startDate = args.startDate;
        if (args.endDate) params.endDate = args.endDate;
        const data = await client.get("/analytics/overview", params);
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
    "nksweb_analytics_pages",
    {
      title: "Analytics Pages",
      description: "Get top pages by visit count with optional date range and result limit",
      inputSchema: {
        startDate: z.string().optional().describe("Start date for the analytics range (e.g. 2024-01-01)"),
        endDate: z.string().optional().describe("End date for the analytics range (e.g. 2024-01-31)"),
        limit: z.number().min(1).max(100).optional().default(10).describe("Maximum number of results to return (1-100, default: 10)"),
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
        const params: Record<string, string | number> = {};
        if (args.startDate) params.startDate = args.startDate;
        if (args.endDate) params.endDate = args.endDate;
        if (args.limit !== undefined) params.limit = args.limit;
        const data = await client.get("/analytics/pages", params);
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
    "nksweb_analytics_referrers",
    {
      title: "Analytics Referrers",
      description: "Get top referrer sources by visit count with optional date range and result limit",
      inputSchema: {
        startDate: z.string().optional().describe("Start date for the analytics range (e.g. 2024-01-01)"),
        endDate: z.string().optional().describe("End date for the analytics range (e.g. 2024-01-31)"),
        limit: z.number().min(1).max(100).optional().default(10).describe("Maximum number of results to return (1-100, default: 10)"),
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
        const params: Record<string, string | number> = {};
        if (args.startDate) params.startDate = args.startDate;
        if (args.endDate) params.endDate = args.endDate;
        if (args.limit !== undefined) params.limit = args.limit;
        const data = await client.get("/analytics/referrers", params);
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
