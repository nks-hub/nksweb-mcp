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

interface ApiResponse<T> {
  status: string;
  data: T;
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
      description: "List CMS pages for the current tenant. Supports filtering by type, status, search term (matches name, url, content), and language. Returns id, name, url, content, type, status, SEO fields, and navigation flags.",
      inputSchema: {
        type: z.enum([
          "default", "homepage", "contact", "gallery", "pricing", "team",
          "faq", "news", "articles", "video_gallery", "product", "features",
          "templates", "demo", "nks-pricing",
        ]).optional().describe("Filter by page type"),
        status: z.union([z.literal(0), z.literal(1)]).optional().describe("Filter by status: 0=disabled, 1=active"),
        search: z.string().optional().describe("Search in page name, URL slug, and HTML content"),
        lang: z.string().optional().describe("Filter by language code (e.g. 'cs', 'en')"),
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
        if (args.type) params.type = args.type;
        if (args.status !== undefined) params.status = String(args.status);
        if (args.search) params.search = args.search;
        if (args.lang) params.lang = args.lang;
        const data = await client.get<Page[]>("/pages", params);
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
        extraData: z.record(z.unknown()).optional().describe("JSON object with structured page data. For homepage type uses hybrid model: text content in content_blocks (key → {label, content}), structural arrays in top-level keys (benefits_items[], pricing_models[], process_steps[], feature_items[]). Use nksweb_upsert_content_block for text edits. Set to null to clear all."),
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
        extraData: z.record(z.unknown()).optional().describe("JSON object with structured page data. For homepage type uses hybrid model: text content in content_blocks (key → {label, content}), structural arrays in top-level keys (benefits_items[], pricing_models[], process_steps[], feature_items[]). Use nksweb_upsert_content_block for text edits. Set to null to clear all."),
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

  // === Content Block Management Tools ===

  server.registerTool(
    "nksweb_list_content_blocks",
    {
      title: "List Content Blocks",
      description:
        "List all content blocks for a page. Content blocks are named text sections stored in extraData.content_blocks, editable via Quill editors in admin. Returns key, label, and HTML content for each block.",
      inputSchema: {
        pageId: z.number().describe("Page ID"),
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
        const resp = await client.get<ApiResponse<Page>>(`/pages/${args.pageId}`);
        const page = resp.data;
        const extraData = (page.extraData as Record<string, unknown>) ?? {};
        const blocks =
          (extraData.content_blocks as Record<
            string,
            { label?: string; content?: string }
          >) ?? {};
        const result = Object.entries(blocks).map(([key, block]) => ({
          key,
          label: typeof block === "object" ? block.label ?? "" : "",
          content:
            typeof block === "object"
              ? block.content ?? ""
              : typeof block === "string"
                ? block
                : "",
        }));
        return {
          content: [{ type: "text" as const, text: truncateResponse(result) }],
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
    "nksweb_upsert_content_block",
    {
      title: "Create or Update Content Block",
      description:
        "Create or update a single content block on a page. Content blocks are named text sections (e.g. 'hero_heading', 'cta_description') stored in extraData.content_blocks. If the block key already exists, it is updated; otherwise a new block is created. Content is HTML. Preserves all other blocks and extraData keys.",
      inputSchema: {
        pageId: z.number().describe("Page ID"),
        key: z
          .string()
          .describe(
            "Block key — snake_case identifier (e.g. 'hero_heading', 'cta_description')"
          ),
        content: z
          .string()
          .describe("HTML content of the block"),
        label: z
          .string()
          .optional()
          .describe(
            "Human-readable label shown in admin (e.g. 'Nadpis hero sekce')"
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
      try {
        const resp = await client.get<ApiResponse<Page>>(`/pages/${args.pageId}`);
        const page = resp.data;
        const extraData = {
          ...((page.extraData as Record<string, unknown>) ?? {}),
        };
        const blocks = {
          ...((extraData.content_blocks as Record<string, unknown>) ?? {}),
        };
        blocks[args.key] = {
          content: args.content,
          label: args.label ?? args.key,
        };
        extraData.content_blocks = blocks;
        const data = await client.put<Page>(`/pages/${args.pageId}`, {
          extraData,
        });
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
    "nksweb_delete_content_block",
    {
      title: "Delete Content Block",
      description:
        "Delete a single content block from a page by key. The template will fall back to its hardcoded default text. Preserves all other blocks and extraData keys.",
      inputSchema: {
        pageId: z.number().describe("Page ID"),
        key: z
          .string()
          .describe("Block key to delete (e.g. 'hero_heading')"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      try {
        const resp = await client.get<ApiResponse<Page>>(`/pages/${args.pageId}`);
        const page = resp.data;
        const extraData = {
          ...((page.extraData as Record<string, unknown>) ?? {}),
        };
        const blocks = {
          ...((extraData.content_blocks as Record<string, unknown>) ?? {}),
        };
        if (!(args.key in blocks)) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Block '${args.key}' not found. Available blocks: ${Object.keys(blocks).join(", ")}`,
              },
            ],
            isError: true,
          };
        }
        delete blocks[args.key];
        extraData.content_blocks = blocks;
        const data = await client.put<Page>(`/pages/${args.pageId}`, {
          extraData,
        });
        return {
          content: [
            {
              type: "text" as const,
              text: `Block '${args.key}' deleted. ${truncateResponse(data)}`,
            },
          ],
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
