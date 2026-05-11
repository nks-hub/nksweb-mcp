import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

const settingsMapOutput = {
  settings: z.record(z.string(), z.unknown()).describe("Settings keyed by name"),
};

const settingValueOutput = {
  key: z.string().optional(),
  value: z.unknown().optional(),
};

export function registerSettingsTools(server: McpServer, client: NksWebClient): void {
  server.registerTool(
    "nksweb_list_settings",
    {
      title: "List Settings",
      description: "List all tenant settings as key-value pairs. Returns configuration like site name, contact info, social links, analytics IDs, theme settings, and feature flags. Settings control the tenant's appearance and behavior.",
      inputSchema: {},
      outputSchema: settingsMapOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Listing settings",
        "openai/toolInvocation/invoked": "Settings listed",
      },
    },
    async () => {
      try {
        const data = await client.get<unknown>("/settings");
        const structured = {
          settings:
            data && typeof data === "object" && !Array.isArray(data)
              ? (data as Record<string, unknown>)
              : { value: data },
        };
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
    "nksweb_get_setting",
    {
      title: "Get Setting",
      description: "Get a specific setting value by its key. Common keys include: site_name, site_description, contact_email, contact_phone, address_*, rybbit_enabled, rybbit_site_id, social media URLs.",
      inputSchema: {
        key: z.string().describe("Setting key name (e.g. 'site_name', 'contact_email', 'rybbit_enabled')"),
      },
      outputSchema: settingValueOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Loading setting",
        "openai/toolInvocation/invoked": "Setting loaded",
      },
    },
    async (args) => {
      try {
        const data = await client.get<unknown>(`/settings/${args.key}`);
        const structured =
          data && typeof data === "object" && !Array.isArray(data)
            ? (data as Record<string, unknown>)
            : { key: args.key, value: data };
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
    "nksweb_update_settings",
    {
      title: "Update Settings",
      description: "Update one or more settings at once. Pass a JSON object with key-value pairs. Only specified keys are updated — others remain unchanged. Use to configure site metadata, contact info, or feature flags.",
      inputSchema: {
        settings: z.record(z.string(), z.string()).describe("Object with setting keys and their new values, e.g. {\"site_name\": \"My Site\", \"contact_email\": \"info@example.com\"}"),
      },
      outputSchema: settingsMapOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Updating settings",
        "openai/toolInvocation/invoked": "Settings updated",
      },
    },
    async (args) => {
      try {
        const data = await client.put<unknown>("/settings", args.settings);
        const structured = {
          settings:
            data && typeof data === "object" && !Array.isArray(data)
              ? (data as Record<string, unknown>)
              : { value: data },
        };
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
}
