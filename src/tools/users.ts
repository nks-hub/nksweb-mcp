import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NksWebClient, truncateResponse } from "../client.js";

interface User {
  id: number;
  username: string;
  name?: string;
  role?: number;
  [key: string]: unknown;
}

const userOutput = {
  id: z.number(),
  username: z.string(),
  name: z.string().optional(),
  role: z.number().optional(),
};

const userListOutput = {
  items: z.array(z.object(userOutput).passthrough()).describe("Admin users matching the query"),
};

const deleteResultOutput = {
  deleted: z.boolean().optional(),
  status: z.string().optional(),
  message: z.string().optional(),
};

export function registerUsersTools(server: McpServer, client: NksWebClient): void {
  server.registerTool(
    "nksweb_list_users",
    {
      title: "List Users",
      description: "List admin users for the current tenant. Returns id, name, username, and role. Sensitive fields (password, tokens) are excluded from the response.",
      inputSchema: {
        page: z.number().optional().default(1).describe("Page number (default: 1)"),
        limit: z.number().optional().default(50).describe("Items per page (default: 50)"),
      },
      outputSchema: userListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Listing users",
        "openai/toolInvocation/invoked": "Users listed",
      },
    },
    async (args) => {
      try {
        const data = await client.get<User[]>("/users", { page: args.page, limit: args.limit });
        const structured = { items: Array.isArray(data) ? data : [] };
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
    "nksweb_get_user",
    {
      title: "Get User",
      description: "Get user profile by ID. Returns name, username, role, and timestamps. Password and security tokens are never exposed.",
      inputSchema: {
        id: z.number().describe("User ID"),
      },
      outputSchema: userOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Loading user",
        "openai/toolInvocation/invoked": "User loaded",
      },
    },
    async (args) => {
      try {
        const data = await client.get<User>(`/users/${args.id}`);
        return {
          structuredContent: data as unknown as Record<string, unknown>,
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
    "nksweb_create_user",
    {
      title: "Create User",
      description: "Create a new admin user. Requires username (must be unique) and password. Role determines access level: 0=Admin (full access), 1=Moderator (limited access).",
      inputSchema: {
        username: z.string().describe("Login username — must be unique across the tenant"),
        password: z.string().describe("Login password — will be hashed server-side"),
        name: z.string().optional().describe("Display name shown in the admin UI"),
        role: z.number().optional().describe("0 = Admin (full access), 1 = Moderator (limited access)"),
      },
      outputSchema: userOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Creating user",
        "openai/toolInvocation/invoked": "User created",
      },
    },
    async (args) => {
      try {
        const data = await client.post<User>("/users", args);
        return {
          structuredContent: data as unknown as Record<string, unknown>,
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
    "nksweb_update_user",
    {
      title: "Update User",
      description: "Update a user's profile. Send only fields to change. Use to rename, change role, or reset password. Username must remain unique.",
      inputSchema: {
        id: z.number().describe("User ID"),
        username: z.string().optional().describe("Login username — must be unique across the tenant"),
        password: z.string().optional().describe("Login password — will be hashed server-side"),
        name: z.string().optional().describe("Display name shown in the admin UI"),
        role: z.number().optional().describe("0 = Admin (full access), 1 = Moderator (limited access)"),
      },
      outputSchema: userOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Updating user",
        "openai/toolInvocation/invoked": "User updated",
      },
    },
    async (args) => {
      try {
        const { id, ...body } = args;
        const data = await client.put<User>(`/users/${id}`, body);
        return {
          structuredContent: data as unknown as Record<string, unknown>,
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
    "nksweb_delete_user",
    {
      title: "Delete User",
      description: "Permanently delete a user account. The user will lose access immediately. Cannot be undone.",
      inputSchema: {
        id: z.number().describe("User ID"),
      },
      outputSchema: deleteResultOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Deleting user",
        "openai/toolInvocation/invoked": "User deleted",
      },
    },
    async (args) => {
      try {
        const data = await client.delete<unknown>(`/users/${args.id}`);
        return {
          structuredContent: (data && typeof data === "object" ? data : { deleted: true }) as Record<string, unknown>,
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
