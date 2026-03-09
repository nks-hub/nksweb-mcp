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
      description: "Get a list of all pages in the NKS Web site",
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
      description: "Get a single page by its ID",
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
      description: "Create a new page in the NKS Web site",
      inputSchema: {
        name: z.string().describe("Page name"),
        url: z.string().describe("Page URL slug"),
        content: z.string().optional().describe("Page HTML content"),
        type: pageTypeSchema.optional().describe("Page type"),
        status: z.union([z.literal(0), z.literal(1)]).optional().describe("Page status: 0 = draft, 1 = published"),
        metaTitle: z.string().optional().describe("SEO meta title"),
        metaDescription: z.string().optional().describe("SEO meta description"),
        position: z.number().optional().describe("Display position / sort order"),
        showInMenu: z.boolean().optional().describe("Whether to show the page in the main menu"),
        showInNavbar: z.boolean().optional().describe("Whether to show the page in the navbar"),
        showInFooter: z.boolean().optional().describe("Whether to show the page in the footer"),
        lang: z.string().optional().describe("Language code, e.g. 'cs' or 'en'"),
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
      description: "Update an existing page by its ID",
      inputSchema: {
        id: z.number().describe("Page ID"),
        name: z.string().optional().describe("Page name"),
        url: z.string().optional().describe("Page URL slug"),
        content: z.string().optional().describe("Page HTML content"),
        type: pageTypeSchema.optional().describe("Page type"),
        status: z.union([z.literal(0), z.literal(1)]).optional().describe("Page status: 0 = draft, 1 = published"),
        metaTitle: z.string().optional().describe("SEO meta title"),
        metaDescription: z.string().optional().describe("SEO meta description"),
        position: z.number().optional().describe("Display position / sort order"),
        showInMenu: z.boolean().optional().describe("Whether to show the page in the main menu"),
        showInNavbar: z.boolean().optional().describe("Whether to show the page in the navbar"),
        showInFooter: z.boolean().optional().describe("Whether to show the page in the footer"),
        lang: z.string().optional().describe("Language code, e.g. 'cs' or 'en'"),
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
      description: "Permanently delete a page by its ID",
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
