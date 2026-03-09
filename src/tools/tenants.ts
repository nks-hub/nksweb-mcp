import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

export function registerTenantsTools(server: McpServer, client: NksWebClient): void {
  server.registerTool(
    "nksweb_list_tenants",
    {
      title: "List Tenants",
      description:
        "List available tenants. With a multi-tenant API key returns all active tenants. " +
        "With a single-tenant key returns only the current tenant info. " +
        "Use the slug with nksweb_set_tenant to switch context.",
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
        const data = await client.get("/tenants");
        const current = client.getTenant();
        const suffix = current
          ? `\n\nCurrent tenant: ${current}`
          : client.isMultiTenant()
            ? `\n\nNo tenant selected. Use nksweb_set_tenant to select one.`
            : "";
        return {
          content: [{ type: "text" as const, text: truncateResponse(data) + suffix }],
        };
      } catch (err) {
        return {
          content: [
            { type: "text" as const, text: `Error: ${(err as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "nksweb_set_tenant",
    {
      title: "Set Active Tenant",
      description:
        "Switch the active tenant context for all subsequent MCP operations. " +
        "After setting, all tools (pages, articles, etc.) will operate on that tenant's data. " +
        "Pass an empty slug to clear the tenant context.",
      inputSchema: {
        slug: z
          .string()
          .describe(
            "Tenant slug to switch to (e.g. 'my-site', 'acme'). Empty string to clear."
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      const slug = args.slug.trim();

      if (!slug) {
        client.setTenant(null);
        if (client.isMultiTenant()) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Tenant context cleared. You must select a tenant with nksweb_set_tenant before performing operations. Available: ${client.getAvailableTenants().join(", ")}`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text: "Tenant context cleared. Operations will use the default tenant.",
            },
          ],
        };
      }

      const available = client.getAvailableTenants();
      if (available.length > 0 && !available.includes(slug)) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Tenant '${slug}' not found. Available tenants: ${available.join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      client.setTenant(slug);
      return {
        content: [
          {
            type: "text" as const,
            text: `Tenant context set to '${slug}'. All subsequent operations will target this tenant.`,
          },
        ],
      };
    }
  );
}
