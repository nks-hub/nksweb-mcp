import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

export function registerSettingsTools(server: McpServer, client: NksWebClient): void {
  server.registerTool(
    "nksweb_list_settings",
    {
      title: "List Settings",
      description: "List all tenant settings as key-value pairs. Returns configuration like site name, contact info, social links, analytics IDs, theme settings, and feature flags. Settings control the tenant's appearance and behavior.",
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
        const data = await client.get("/settings");
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
    "nksweb_get_setting",
    {
      title: "Get Setting",
      description: "Get a specific setting value by its key. Common keys include: site_name, site_description, contact_email, contact_phone, address_*, rybbit_enabled, rybbit_site_id, social media URLs.",
      inputSchema: {
        key: z.string().describe("Setting key name (e.g. 'site_name', 'contact_email', 'rybbit_enabled')"),
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
        const data = await client.get(`/settings/${args.key}`);
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
    "nksweb_update_settings",
    {
      title: "Update Settings",
      description: "Update one or more settings at once. Pass a JSON object with key-value pairs. Only specified keys are updated — others remain unchanged. Use to configure site metadata, contact info, or feature flags.",
      inputSchema: {
        settings: z.record(z.string(), z.string()).describe("Object with setting keys and their new values, e.g. {\"site_name\": \"My Site\", \"contact_email\": \"info@example.com\"}"),
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
        const data = await client.put("/settings", args.settings);
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
