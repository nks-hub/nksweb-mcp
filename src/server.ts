/**
 * NKS-Web MCP server — library entry point.
 *
 * Exports `createNksWebServer(config)` so consumers (mcp-gateway, tests) can
 * construct a fully-wired McpServer instance and attach their own transport.
 *
 * Transport selection lives in `index.ts` (CLI).
 */

import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

export const NKSWEB_SERVER_NAME = "nksweb-mcp";
export const NKSWEB_SERVER_VERSION = pkg.version;

export const NKSWEB_INSTRUCTIONS =
  "NKS-Web CMS MCP server for tenant management. " +
  "Manage pages, articles, categories, news, files, users, messages, redirects, settings, and analytics. " +
  "All write operations require appropriate API key scopes (e.g. pages:write, articles:write). " +
  "Use list tools first to discover existing content, then get/create/update/delete as needed. " +
  "Analytics tools accept startDate/endDate (YYYY-MM-DD format, defaults to last 30 days). " +
  "Multi-tenant: Use nksweb_list_tenants to see available tenants, " +
  "then nksweb_set_tenant to switch context. All subsequent operations will target that tenant.";

export async function createNksWebServer(config: NksWebConfig): Promise<McpServer> {
  const client = new NksWebClient(config);

  try {
    await client.detectTenantMode();
  } catch (err) {
    console.error(
      `[${NKSWEB_SERVER_NAME}] Warning: detectTenantMode failed, continuing anyway:`,
      err instanceof Error ? err.message : err
    );
  }

  const server = new McpServer(
    { name: NKSWEB_SERVER_NAME, version: NKSWEB_SERVER_VERSION },
    { instructions: NKSWEB_INSTRUCTIONS }
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

  return server;
}

export type { NksWebConfig } from "./client.js";
export { NksWebClient } from "./client.js";
