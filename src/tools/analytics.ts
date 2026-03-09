import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

const dateSchema = {
  startDate: z.string().optional().describe("Start date YYYY-MM-DD (default: 30 days ago)"),
  endDate: z.string().optional().describe("End date YYYY-MM-DD (default: today)"),
};

const limitSchema = {
  limit: z.number().min(1).max(100).optional().describe("Max results 1-100 (default: 10)"),
};

function buildDateParams(args: { startDate?: string; endDate?: string; limit?: number }): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (args.startDate) params.startDate = args.startDate;
  if (args.endDate) params.endDate = args.endDate;
  if (args.limit !== undefined) params.limit = args.limit;
  return params;
}

export function registerAnalyticsTools(server: McpServer, client: NksWebClient): void {
  server.registerTool(
    "nksweb_analytics_overview",
    {
      title: "Analytics Overview",
      description:
        "Get aggregated traffic stats: sessions, pageviews, unique users, " +
        "pages/session, bounce rate (%), avg session duration (seconds). " +
        "Defaults to last 30 days.",
      inputSchema: { ...dateSchema },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      try {
        const data = await client.get("/analytics/overview", buildDateParams(args));
        return {
          content: [{ type: "text" as const, text: truncateResponse(data) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "nksweb_analytics_pages",
    {
      title: "Analytics Top Pages",
      description:
        "Top visited pages ranked by visit count. Returns page path, " +
        "visit count, pageviews, traffic percentage, avg time on page, bounce rate.",
      inputSchema: { ...dateSchema, ...limitSchema },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      try {
        const data = await client.get("/analytics/pages", buildDateParams(args));
        return {
          content: [{ type: "text" as const, text: truncateResponse(data) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "nksweb_analytics_referrers",
    {
      title: "Analytics Top Referrers",
      description:
        "Top traffic sources ranked by visitor count. Shows referrer " +
        "domain/URL, visit count, and percentage of total traffic.",
      inputSchema: { ...dateSchema, ...limitSchema },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      try {
        const data = await client.get("/analytics/referrers", buildDateParams(args));
        return {
          content: [{ type: "text" as const, text: truncateResponse(data) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "nksweb_analytics_metric",
    {
      title: "Analytics Metric Breakdown",
      description:
        "Get breakdown by any analytics dimension. Returns ranked list " +
        "of values with visit counts and percentages. Use for countries, " +
        "browsers, devices, OS, UTM campaigns, cities, regions, or languages.",
      inputSchema: {
        metric: z.enum([
          "pathname", "referrer", "country", "region", "city",
          "browser", "os", "device_type", "utm_source", "utm_medium",
          "utm_campaign", "utm_content", "utm_term", "language",
        ]).describe("Dimension to break down by"),
        ...dateSchema,
        ...limitSchema,
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
        const params = buildDateParams(args);
        const data = await client.get(`/analytics/metrics/${args.metric}`, params);
        return {
          content: [{ type: "text" as const, text: truncateResponse(data) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        };
      }
    }
  );
}
