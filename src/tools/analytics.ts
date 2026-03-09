import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

export function registerAnalyticsTools(server: McpServer, client: NksWebClient): void {
  server.registerTool(
    "nksweb_analytics_overview",
    {
      title: "Analytics Overview",
      description: "Get aggregated traffic analytics for the current tenant. Returns sessions count, pageviews, unique users, pages per session, bounce rate (%), and average session duration (seconds). Data comes from Rybbit Analytics. Defaults to last 30 days if no date range specified.",
      inputSchema: {
        startDate: z.string().optional().describe("Start date in YYYY-MM-DD format (default: 30 days ago)"),
        endDate: z.string().optional().describe("End date in YYYY-MM-DD format (default: today)"),
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
      description: "Get the most visited pages ranked by visit count. Returns page path, hostname, visit count, pageview count, percentage of total traffic, average time on page, and bounce rate per page. Use to understand which content gets the most traffic.",
      inputSchema: {
        startDate: z.string().optional().describe("Start date in YYYY-MM-DD format (default: 30 days ago)"),
        endDate: z.string().optional().describe("End date in YYYY-MM-DD format (default: today)"),
        limit: z.number().min(1).max(100).optional().default(10).describe("Maximum number of results to return, 1-100 (default: 10)"),
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
      description: "Get top traffic referrer sources ranked by visitor count. Returns referrer domain/URL, visit count, and percentage. Use to understand where visitors come from (search engines, social media, other sites).",
      inputSchema: {
        startDate: z.string().optional().describe("Start date in YYYY-MM-DD format (default: 30 days ago)"),
        endDate: z.string().optional().describe("End date in YYYY-MM-DD format (default: today)"),
        limit: z.number().min(1).max(100).optional().default(10).describe("Maximum number of results to return, 1-100 (default: 10)"),
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
