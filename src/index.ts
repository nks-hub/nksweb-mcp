#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { NksWebClient, NksWebConfig } from "./client.js";
import { registerPagesTools } from "./tools/pages.js";
import { registerArticlesTools } from "./tools/articles.js";
import { registerCategoriesTools } from "./tools/categories.js";
import { registerNewsTools } from "./tools/news.js";
import { registerFilesTools } from "./tools/files.js";
import { registerUsersTools } from "./tools/users.js";
import { registerMessagesTools } from "./tools/messages.js";
import { registerRedirectsTools } from "./tools/redirects.js";
import { registerSettingsTools } from "./tools/settings.js";
import { registerAnalyticsTools } from "./tools/analytics.js";
import { registerTenantsTools } from "./tools/tenants.js";

function getConfig(): NksWebConfig {
  const baseUrl = process.env.NKSWEB_URL;
  const apiKey = process.env.NKSWEB_API_KEY;

  if (!baseUrl) {
    console.error("Missing NKSWEB_URL environment variable");
    process.exit(1);
  }
  if (!apiKey) {
    console.error("Missing NKSWEB_API_KEY environment variable");
    process.exit(1);
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

async function main() {
  const config = getConfig();
  const client = new NksWebClient(config);

  const server = new McpServer(
    {
      name: "nksweb-mcp",
      version: "0.1.0",
    },
    {
      instructions:
        "NKS-Web CMS MCP server for tenant management. " +
        "Manage pages, articles, categories, news, files, users, messages, redirects, settings, and analytics. " +
        "All write operations require appropriate API key scopes (e.g. pages:write, articles:write). " +
        "Use list tools first to discover existing content, then get/create/update/delete as needed. " +
        "Analytics tools accept startDate/endDate (YYYY-MM-DD format, defaults to last 30 days). " +
        "Multi-tenant: Use nksweb_list_tenants to see available tenants, " +
        "then nksweb_set_tenant to switch context. All subsequent operations will target that tenant.",
    }
  );

  registerPagesTools(server, client);
  registerArticlesTools(server, client);
  registerCategoriesTools(server, client);
  registerNewsTools(server, client);
  registerFilesTools(server, client);
  registerUsersTools(server, client);
  registerMessagesTools(server, client);
  registerRedirectsTools(server, client);
  registerSettingsTools(server, client);
  registerAnalyticsTools(server, client);
  registerTenantsTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("NKS-Web MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
