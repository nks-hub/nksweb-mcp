import { CHARACTER_LIMIT, REQUEST_TIMEOUT_MS } from "./constants.js";

export interface NksWebConfig {
  baseUrl: string;
  apiKey: string;
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export class NksWebClient {
  private tenantSlug: string | null = null;
  private multiTenant = false;
  private availableTenants: string[] = [];

  constructor(private config: NksWebConfig) {}

  setTenant(slug: string | null): void {
    this.tenantSlug = slug;
  }

  getTenant(): string | null {
    return this.tenantSlug;
  }

  isMultiTenant(): boolean {
    return this.multiTenant;
  }

  getAvailableTenants(): string[] {
    return this.availableTenants;
  }

  /**
   * Detect tenant mode at startup.
   * If only 1 tenant → auto-select it.
   * If multiple → require explicit set_tenant.
   */
  async detectTenantMode(): Promise<void> {
    try {
      const resp = await this.get<{ status: string; data: Array<{ slug: string; name?: string }> }>("/tenants");
      const tenants = resp.data ?? [];
      this.availableTenants = tenants.map((t) => t.slug);

      if (tenants.length === 1) {
        this.tenantSlug = tenants[0].slug;
        this.multiTenant = false;
        console.error(`Auto-selected tenant: ${this.tenantSlug}`);
      } else if (tenants.length > 1) {
        this.multiTenant = true;
        console.error(`Multi-tenant mode: ${tenants.length} tenants available. Use nksweb_set_tenant to select.`);
      }
    } catch {
      console.error("Could not detect tenant mode, continuing without auto-selection.");
    }
  }

  /**
   * Check if a tenant is selected. Returns null if OK, error string if not.
   */
  requireTenant(): string | null {
    if (this.tenantSlug) return null;
    if (!this.multiTenant) return null;

    return (
      `No tenant selected. This API key has access to ${this.availableTenants.length} tenants: ${this.availableTenants.join(", ")}. ` +
      `Use nksweb_set_tenant to select a tenant before performing operations.`
    );
  }

  async get<T>(path: string, params?: QueryParams): Promise<T> {
    return this.request<T>("GET", path, undefined, params);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  private buildUrl(path: string, params?: QueryParams): string {
    const base = `${this.config.baseUrl}/api/v1${path}`;
    if (!params) return base;

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    }

    const qs = searchParams.toString();
    return qs ? `${base}?${qs}` : base;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: QueryParams
  ): Promise<T> {
    // Tenant guard: skip for /tenants endpoint (used for discovery)
    if (path !== "/tenants") {
      const tenantError = this.requireTenant();
      if (tenantError) {
        throw new Error(tenantError);
      }
    }

    const url = this.buildUrl(path, params);
    const headers: Record<string, string> = {
      "X-Api-Key": this.config.apiKey,
      "Accept": "application/json",
    };

    if (this.tenantSlug) {
      headers["X-Tenant"] = this.tenantSlug;
    }

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error(
          `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s.`
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (res.status === 204) {
      return { deleted: true } as unknown as T;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(formatApiError(res.status, text));
    }

    return (await res.json()) as T;
  }
}

function formatApiError(status: number, body: string): string {
  let detail = "";
  try {
    const json = JSON.parse(body);
    detail = json.message || "";
  } catch {
    detail = body.slice(0, 300);
  }

  switch (status) {
    case 400:
      return `Validation error: ${detail}`;
    case 401:
      return "Authentication failed. Check NKSWEB_API_KEY environment variable.";
    case 403:
      return `Permission denied: ${detail || "Missing required scope. Check API key scopes."}`;
    case 404:
      return `Resource not found: ${detail || "Check the ID is correct."}`;
    case 409:
      return `Conflict: ${detail}`;
    case 429:
      return "Rate limit exceeded. Wait before making more requests.";
    case 502:
      return `Service error: ${detail}`;
    case 503:
      return `Service unavailable: ${detail}`;
    default:
      return `API error (${status}): ${detail}`;
  }
}

export function truncateResponse(data: unknown): string {
  const json = JSON.stringify(data, null, 2);
  if (json.length <= CHARACTER_LIMIT) return json;

  if (Array.isArray(data)) {
    const half = Math.max(1, Math.floor(data.length / 2));
    const truncated = data.slice(0, half);
    const result = {
      data: truncated,
      truncated: true,
      message: `Truncated from ${data.length} to ${half} items. Use pagination to get more.`,
    };
    return JSON.stringify(result, null, 2);
  }

  return (
    json.slice(0, CHARACTER_LIMIT) +
    `\n\n[Truncated at ${CHARACTER_LIMIT} characters]`
  );
}
