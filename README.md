# @nks-hub/nksweb-mcp

[![npm version](https://img.shields.io/npm/v/@nks-hub/nksweb-mcp.svg)](https://www.npmjs.com/package/@nks-hub/nksweb-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178c6.svg)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.27+-8b5cf6.svg)](https://modelcontextprotocol.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933.svg)](https://nodejs.org)

> MCP server for [NKS-Web CMS](https://nks-hub.cz) — manage pages, articles, news, files, users, analytics, and more directly from Claude Code or any MCP-compatible client.

---

## Why?

Instead of switching between admin panels, let your AI assistant manage CMS content directly:

- "List all active pages on the site"
- "Create a new article about product updates"
- "What are the top visited pages this month?"
- "Show me browser breakdown from analytics"
- "Switch to the acme tenant and list their news"

---

## Quick Start

### Installation

```bash
npm install -g @nks-hub/nksweb-mcp
```

Or clone and build:

```bash
git clone https://github.com/nks-hub/nksweb-mcp.git
cd nksweb-mcp
npm install && npm run build
```

### Configuration

Add to your `~/.claude/.mcp.json` or project-level MCP config:

```json
{
  "mcpServers": {
    "nksweb": {
      "command": "node",
      "args": ["/path/to/nksweb-mcp/build/index.js"],
      "env": {
        "NKSWEB_URL": "https://your-site.com",
        "NKSWEB_API_KEY": "nks_your_api_key"
      }
    }
  }
}
```

Or via Claude Code CLI:

```bash
claude mcp add nksweb -e NKSWEB_URL=https://your-site.com -e NKSWEB_API_KEY=nks_your_key -- npx @nks-hub/nksweb-mcp
```

### Usage

Ask Claude Code anything about your CMS content. All tools are automatically available.

---

## Features

| Feature | Description |
|---------|-------------|
| **49 Tools** | Complete CMS management — pages, articles, categories, news, files, users, messages, redirects, settings, analytics, tenants |
| **Content Blocks** | Create, update, delete individual content blocks within pages (Quill editor-compatible) |
| **Multi-Tenant** | List available tenants and switch context to manage any tenant's data |
| **Page Filtering** | Filter pages by type, status, language, or full-text search across name/URL/content |
| **Analytics Metrics** | 14 analytics dimensions — countries, browsers, devices, UTM campaigns, and more |
| **Tool Annotations** | MCP annotations (readOnly, destructive, idempotent) for safe AI tool usage |
| **Response Truncation** | Auto-truncation at 25k chars to prevent context bloat |
| **Actionable Errors** | HTTP status-aware error messages that guide the LLM toward correct usage |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NKSWEB_URL` | Yes | Base URL of the NKS-Web instance (e.g. `https://your-site.com`) |
| `NKSWEB_API_KEY` | Yes | API key with appropriate scopes (prefix `nks_`) |

---

## Tools (49)

### Pages (8 tools)

| Tool | Description |
|------|-------------|
| `nksweb_list_pages` | List pages with optional filters: `type`, `status`, `search`, `lang` |
| `nksweb_get_page` | Get full page detail by ID including HTML content and extraData |
| `nksweb_create_page` | Create a new page with content, type, SEO, and navigation settings |
| `nksweb_update_page` | Update an existing page (partial update — only send changed fields) |
| `nksweb_delete_page` | Delete a page (soft-delete) |
| `nksweb_list_content_blocks` | List all named content blocks for a page |
| `nksweb_upsert_content_block` | Create or update a single content block by key |
| `nksweb_delete_content_block` | Delete a content block from a page |

### Articles (5 tools)

| Tool | Description |
|------|-------------|
| `nksweb_list_articles` | List all articles |
| `nksweb_get_article` | Get article detail by ID |
| `nksweb_create_article` | Create article with content, categories, and SEO |
| `nksweb_update_article` | Update an existing article |
| `nksweb_delete_article` | Delete an article |

### Categories (5 tools)

| Tool | Description |
|------|-------------|
| `nksweb_list_categories` | List all article categories |
| `nksweb_get_category` | Get category detail by ID |
| `nksweb_create_category` | Create a category (supports nested tree) |
| `nksweb_update_category` | Update a category |
| `nksweb_delete_category` | Delete a category |

### News (5 tools)

| Tool | Description |
|------|-------------|
| `nksweb_list_news` | List all news items |
| `nksweb_get_news_item` | Get news item detail by ID |
| `nksweb_create_news` | Create a news item |
| `nksweb_update_news` | Update a news item |
| `nksweb_delete_news` | Delete a news item |

### Files (3 tools)

| Tool | Description |
|------|-------------|
| `nksweb_list_files` | List all uploaded files |
| `nksweb_get_file` | Get file metadata by ID |
| `nksweb_delete_file` | Delete a file |

### Users (5 tools)

| Tool | Description |
|------|-------------|
| `nksweb_list_users` | List all admin users |
| `nksweb_get_user` | Get user detail by ID |
| `nksweb_create_user` | Create a new admin user |
| `nksweb_update_user` | Update user profile or role |
| `nksweb_delete_user` | Delete a user |

### Messages (4 tools)

| Tool | Description |
|------|-------------|
| `nksweb_list_messages` | List all contact form messages |
| `nksweb_get_message` | Get message detail by ID |
| `nksweb_mark_message_read` | Mark a message as read/unread |
| `nksweb_delete_message` | Delete a message |

### Redirects (5 tools)

| Tool | Description |
|------|-------------|
| `nksweb_list_redirects` | List all URL redirects |
| `nksweb_get_redirect` | Get redirect detail by ID |
| `nksweb_create_redirect` | Create a redirect rule (301/302/307) |
| `nksweb_update_redirect` | Update a redirect |
| `nksweb_delete_redirect` | Delete a redirect |

### Settings (3 tools)

| Tool | Description |
|------|-------------|
| `nksweb_list_settings` | List all tenant settings |
| `nksweb_get_setting` | Get a specific setting by key |
| `nksweb_update_settings` | Update one or more settings |

### Analytics (4 tools)

| Tool | Description |
|------|-------------|
| `nksweb_analytics_overview` | Traffic overview — sessions, pageviews, users, bounce rate, avg duration |
| `nksweb_analytics_pages` | Top visited pages with visit count, pageviews, bounce rate |
| `nksweb_analytics_referrers` | Top traffic sources with visit count and percentage |
| `nksweb_analytics_metric` | Breakdown by dimension: `country`, `browser`, `os`, `device_type`, `city`, `region`, `language`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `pathname`, `referrer` |

### Tenants (2 tools)

| Tool | Description |
|------|-------------|
| `nksweb_list_tenants` | List available tenants (multi-tenant key: all tenants, single-tenant key: current tenant) |
| `nksweb_set_tenant` | Switch active tenant context — all subsequent operations target that tenant |

---

## API Key Scopes

The API key needs appropriate scopes for the tools you want to use:

| Scope | Tools |
|-------|-------|
| `pages:read` | list, get pages and content blocks |
| `pages:write` | create, update, delete pages and content blocks |
| `articles:read` / `articles:write` | article management |
| `categories:read` / `categories:write` | category management |
| `news:read` / `news:write` | news management |
| `files:read` / `files:write` | file management |
| `users:read` / `users:write` | user management |
| `messages:read` / `messages:write` | message management |
| `redirects:read` / `redirects:write` | redirect management |
| `settings:read` / `settings:write` | settings management |
| `analytics:read` | analytics access |
| `tenants:read` | tenant listing |

---

## Page Filtering

The `nksweb_list_pages` tool supports these query filters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by page type: `default`, `homepage`, `contact`, `gallery`, `pricing`, `team`, `faq`, `news`, `articles`, `video_gallery`, `product`, `features`, `templates`, `demo`, `nks-pricing` |
| `status` | number | `0` = disabled/draft, `1` = active/published |
| `search` | string | Full-text search across page name, URL slug, and HTML content |
| `lang` | string | ISO 639-1 language code (e.g. `cs`, `en`) |

---

## Analytics Parameters

All analytics tools accept optional date range parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | string | Start date `YYYY-MM-DD` (default: 30 days ago) |
| `endDate` | string | End date `YYYY-MM-DD` (default: today) |
| `limit` | number | Max results 1–100 (default: 10) |

### Available Metrics

The `nksweb_analytics_metric` tool supports these dimensions:

| Metric | Description |
|--------|-------------|
| `pathname` | Page paths (same as top pages) |
| `referrer` | Traffic sources |
| `country` | Visitor countries |
| `region` | Visitor regions/states |
| `city` | Visitor cities |
| `browser` | Browser names (Chrome, Firefox, Safari, ...) |
| `os` | Operating systems (Windows, macOS, iOS, Android, ...) |
| `device_type` | Device categories (desktop, mobile, tablet) |
| `language` | Browser language settings |
| `utm_source` | UTM source parameter |
| `utm_medium` | UTM medium parameter |
| `utm_campaign` | UTM campaign parameter |
| `utm_content` | UTM content parameter |
| `utm_term` | UTM term parameter |

---

## Project Structure

```
nksweb-mcp/
├── src/
│   ├── index.ts          # Entry point, MCP server setup
│   ├── client.ts         # HTTP client with tenant switching (X-Tenant header)
│   ├── constants.ts      # Timeouts and limits
│   └── tools/
│       ├── pages.ts      # Pages + content blocks (8 tools)
│       ├── articles.ts   # Articles CRUD (5 tools)
│       ├── categories.ts # Categories CRUD (5 tools)
│       ├── news.ts       # News CRUD (5 tools)
│       ├── files.ts      # Files management (3 tools)
│       ├── users.ts      # Users CRUD (5 tools)
│       ├── messages.ts   # Messages management (4 tools)
│       ├── redirects.ts  # Redirects CRUD (5 tools)
│       ├── settings.ts   # Settings management (3 tools)
│       ├── analytics.ts  # Analytics queries (4 tools)
│       └── tenants.ts    # Multi-tenant switching (2 tools)
├── tests/
│   └── integration.test.ts
├── build/                # Compiled JS output
├── package.json
├── tsconfig.json
└── LICENSE
```

---

## Examples

### Content Management

```
User: "List all active pages"
→ nksweb_list_pages { status: 1 }

User: "Find pages containing 'pricing'"
→ nksweb_list_pages { search: "pricing" }

User: "Show me the homepage"
→ nksweb_list_pages { type: "homepage" }

User: "Create a new FAQ page"
→ nksweb_create_page { name: "FAQ", url: "faq", type: "faq", status: 1,
    content: "<h1>Frequently Asked Questions</h1>" }

User: "Update the hero heading on homepage"
→ nksweb_upsert_content_block { pageId: 14, key: "hero_heading",
    content: "Digital Solutions That Work", label: "Hero Heading" }
```

### Analytics

```
User: "How's the site traffic this month?"
→ nksweb_analytics_overview { startDate: "2026-03-01" }

User: "What browsers do our visitors use?"
→ nksweb_analytics_metric { metric: "browser", limit: 10 }

User: "Show country breakdown for last week"
→ nksweb_analytics_metric { metric: "country",
    startDate: "2026-03-02", endDate: "2026-03-09" }

User: "Top 5 most visited pages"
→ nksweb_analytics_pages { limit: 5 }

User: "Where does our traffic come from?"
→ nksweb_analytics_referrers {}
```

### Multi-Tenant

```
User: "What tenants are available?"
→ nksweb_list_tenants {}

User: "Switch to the acme tenant"
→ nksweb_set_tenant { slug: "acme" }

User: "Now list their pages"
→ nksweb_list_pages {}  (automatically targets acme)

User: "Go back to default"
→ nksweb_set_tenant { slug: "" }
```

### Articles & News

```
User: "Create an article about our new feature"
→ nksweb_create_article { title: "Introducing Smart Search",
    url: "introducing-smart-search", status: 1,
    content: "<p>We're excited to announce...</p>" }

User: "List all news items"
→ nksweb_list_news {}

User: "Delete news item #5"
→ nksweb_delete_news { id: 5 }
```

### Settings & Redirects

```
User: "What settings does this tenant have?"
→ nksweb_list_settings {}

User: "Add a redirect from /old-page to /new-page"
→ nksweb_create_redirect { source: "/old-page", target: "/new-page",
    statusCode: 301, isActive: true }

User: "Show all contact form messages"
→ nksweb_list_messages {}
```

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Run integration tests
npm test

# Type checking
npx tsc --noEmit
```

---

## Requirements

- **Node.js**: 18+
- **NKS-Web CMS**: Instance with API enabled and API key created

---

## Contributing

Contributions are welcome! For major changes, please open an issue first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: description'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

- 📧 **Email:** dev@nks-hub.cz
- 🐛 **Bug reports:** [GitHub Issues](https://github.com/nks-hub/nksweb-mcp/issues)
- 📖 **MCP Protocol:** [modelcontextprotocol.io](https://modelcontextprotocol.io/)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Links

- [NKS-Web CMS](https://nks-hub.cz)
- [npm Package](https://www.npmjs.com/package/@nks-hub/nksweb-mcp)
- [@nks-hub/rybbit-mcp](https://github.com/nks-hub/rybbit-mcp) — MCP server for Rybbit Analytics
- [@nks-hub/rybbit-ts](https://github.com/nks-hub/rybbit-ts) — TypeScript tracking SDK

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/nks-hub">NKS Hub</a>
</p>
