import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

interface Page {
  id: number;
  name: string;
  url: string;
  content?: string;
  type?: string;
  status?: number;
  metaTitle?: string;
  metaDescription?: string;
  position?: number;
  showInMenu?: boolean;
  showInNavbar?: boolean;
  showInFooter?: boolean;
  lang?: string;
  [key: string]: unknown;
}

const pageTypeSchema = z.enum([
  "default",
  "homepage",
  "contact",
  "gallery",
  "pricing",
  "team",
  "faq",
  "news",
  "articles",
  "video_gallery",
  "product",
  "features",
  "templates",
  "demo",
  "nks-pricing",
]);

export function registerPagesTools(
  server: McpServer,
  client: NksWebClient
): void {
  server.registerTool(
    "nksweb_list_pages",
    {
      title: "List Pages",
      description: "List all CMS pages for the current tenant. Returns id, name, url, content, type (default/homepage/contact/gallery/pricing/team/faq/news/articles/video_gallery/product/features/templates/demo/nks-pricing), status (0=disabled, 1=active), SEO fields, and navigation flags (showInMenu, showInNavbar, showInFooter). Use this to discover existing site pages before creating or updating.",
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
        const data = await client.get<Page[]>("/pages");
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
    "nksweb_get_page",
    {
      title: "Get Page",
      description: "Get full details of a single page by ID including HTML content, SEO metadata, navigation settings, and timestamps.",
      inputSchema: {
        id: z.number().describe("Page ID"),
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
        const data = await client.get<Page>(`/pages/${args.id}`);
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
    "nksweb_create_page",
    {
      title: "Create Page",
      description: "Create a new CMS page. Requires name and url (slug). The page type determines the template used for rendering. Set status=1 to publish, status=0 for draft. Navigation flags control where the page appears in menus.",
      inputSchema: {
        name: z.string().describe("Page display name shown in navigation and headings"),
        url: z.string().describe("URL slug — must be unique, lowercase, no spaces (e.g. 'about-us')"),
        content: z.string().optional().describe("HTML content of the page body"),
        type: pageTypeSchema.optional().describe("Page template type determining layout and functionality (default/homepage/contact/gallery/pricing/team/faq/news/articles/video_gallery/product/features/templates/demo/nks-pricing)"),
        status: z.union([z.literal(0), z.literal(1)]).optional().describe("0 = draft/disabled, 1 = published/active"),
        metaTitle: z.string().optional().describe("SEO title tag (shown in browser tab and search results)"),
        metaDescription: z.string().optional().describe("SEO meta description (shown in search result snippets)"),
        extraData: z.record(z.unknown()).optional().describe("JSON object with structured page data. For homepage type: hero (heading, badge, stats, cta_primary, cta_secondary), benefits (badge, title, description, items[]), pricing (badge, title, models[]), process (badge, title, steps[]), features (title, items[]), cta (title, description). Set to null to clear."),
        position: z.number().optional().describe("Display order — lower numbers appear first (default: 0)"),
        showInMenu: z.boolean().optional().describe("Show this page in the main navigation menu"),
        showInNavbar: z.boolean().optional().describe("Show this page in the top navbar"),
        showInFooter: z.boolean().optional().describe("Show this page in the footer navigation"),
        lang: z.string().optional().describe("Language code ISO 639-1 (e.g. 'cs', 'en')"),
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
        const data = await client.post<Page>("/pages", args);
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
    "nksweb_update_page",
    {
      title: "Update Page",
      description: "Update an existing page. Only send fields you want to change — omitted fields keep their current values. Use this to publish drafts (status=1), update content, or change navigation placement.",
      inputSchema: {
        id: z.number().describe("Page ID"),
        name: z.string().optional().describe("Page display name shown in navigation and headings"),
        url: z.string().optional().describe("URL slug — must be unique, lowercase, no spaces (e.g. 'about-us')"),
        content: z.string().optional().describe("HTML content of the page body"),
        type: pageTypeSchema.optional().describe("Page template type determining layout and functionality (default/homepage/contact/gallery/pricing/team/faq/news/articles/video_gallery/product/features/templates/demo/nks-pricing)"),
        status: z.union([z.literal(0), z.literal(1)]).optional().describe("0 = draft/disabled, 1 = published/active"),
        metaTitle: z.string().optional().describe("SEO title tag (shown in browser tab and search results)"),
        metaDescription: z.string().optional().describe("SEO meta description (shown in search result snippets)"),
        extraData: z.record(z.unknown()).optional().describe("JSON object with structured page data. For homepage type: hero (heading, badge, stats, cta_primary, cta_secondary), benefits (badge, title, description, items[]), pricing (badge, title, models[]), process (badge, title, steps[]), features (title, items[]), cta (title, description). Set to null to clear."),
        position: z.number().optional().describe("Display order — lower numbers appear first (default: 0)"),
        showInMenu: z.boolean().optional().describe("Show this page in the main navigation menu"),
        showInNavbar: z.boolean().optional().describe("Show this page in the top navbar"),
        showInFooter: z.boolean().optional().describe("Show this page in the footer navigation"),
        lang: z.string().optional().describe("Language code ISO 639-1 (e.g. 'cs', 'en')"),
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
        const data = await client.put<Page>(`/pages/${id}`, body);
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
    "nksweb_delete_page",
    {
      title: "Delete Page",
      description: "Permanently delete a page by ID. This uses soft-delete — the page may still exist in the database but won't appear in listings. This action cannot be undone via the API.",
      inputSchema: {
        id: z.number().describe("Page ID"),
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
        const data = await client.delete<unknown>(`/pages/${args.id}`);
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
