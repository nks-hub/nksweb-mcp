---
name: nksweb-mcp
description: "NKS-Web CMS management via MCP. Use this skill whenever the user mentions website content, CMS operations, page management, article publishing, category organization, news/announcements, file/media management, user administration, contact form messages, URL redirects, site settings, web analytics metrics, multi-tenant management, or NKS-Web. Covers full CRUD for pages, articles, categories, news, files, users, messages, redirects, settings, plus analytics with 14 dimensions (country, browser, OS, device, UTM campaigns, etc.) and multi-tenant switching."
---

# NKS-Web MCP Server Skill

## 1. Purpose & Context

NKS-Web is a multi-tenant CMS (Content Management System) built on Nette Framework + Doctrine ORM + MySQL. It manages multiple websites from a single codebase with tenant isolation via separate databases per tenant.

**Architecture:**
- **Master DB:** `nksweb_master` (tenant registry, API keys)
- **Tenant DBs:** `nksweb_{slug}` (per-tenant content: pages, articles, files, etc.)
- **SuperAdmin API key** (prefix `nks_sa_`) can access all tenants via `X-Tenant` header
- **Regular API key** operates on a single tenant only

This MCP server exposes **49 tools** for complete CMS management: pages (with content blocks), articles, categories, news, files, users, messages, redirects, settings, analytics, and tenant switching. All communication goes through the NKS-Web REST API (`/api/v1/*`).

**Stack:** TypeScript, `@modelcontextprotocol/sdk` v1.27+, Zod validation, Node.js 18+, StdioServerTransport.

---

## 2. Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NKSWEB_URL` | Yes | Base URL of the NKS-Web instance (e.g. `https://example.com`) |
| `NKSWEB_API_KEY` | Yes | API key with required scopes (prefix `nks_` or `nks_sa_`) |

### Claude Code MCP Config

Add to `~/.claude/.mcp.json` or project-level MCP config:

```json
{
  "mcpServers": {
    "nksweb": {
      "command": "npx",
      "args": ["-y", "@nks-hub/nksweb-mcp"],
      "env": {
        "NKSWEB_URL": "https://your-site.com",
        "NKSWEB_API_KEY": "nks_your_api_key"
      }
    }
  }
}
```

Or via CLI:
```bash
claude mcp add nksweb -e NKSWEB_URL=https://your-site.com -e NKSWEB_API_KEY=nks_key -- npx @nks-hub/nksweb-mcp
```

### SuperAdmin vs Tenant Key

| Feature | SuperAdmin Key (`nks_sa_*`) | Tenant Key (`nks_*`) |
|---------|---------------------------|---------------------|
| `nksweb_list_tenants` | Returns all active tenants | Returns only the bound tenant |
| `nksweb_set_tenant` | Switches to any tenant | No effect (locked to one tenant) |
| Multi-tenant operations | Full access with `X-Tenant` header | Single-tenant only |
| Auto-detection at startup | If 1 tenant: auto-selects; if multiple: requires `set_tenant` | Auto-selects the bound tenant |

---

## 3. Multi-Tenant Operations

### nksweb_list_tenants
List available tenants. With a multi-tenant API key returns all active tenants with slug and name. With a single-tenant key returns only the current tenant info. Also displays the currently selected tenant.

**Parameters:** None

**Returns:** Array of `{ slug, name }` objects + current tenant indicator.

---

### nksweb_set_tenant
Switch the active tenant context. After setting, ALL subsequent tool calls (pages, articles, analytics, etc.) target that tenant's data. The tenant slug is sent as `X-Tenant` HTTP header on every request.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | Yes | Tenant slug (e.g. `"my-site"`). Empty string `""` clears the context. |

**Behavior:**
- If the slug is not in the available tenants list, returns an error with available options.
- Clearing the context on a multi-tenant key requires re-selection before any operations.
- Clearing the context on a single-tenant key falls back to the default tenant.

---

### How X-Tenant Header Works

1. At startup, the client calls `GET /api/v1/tenants` to detect available tenants.
2. If only 1 tenant exists, it is auto-selected (no explicit `set_tenant` needed).
3. If multiple tenants exist, the server enters multi-tenant mode and requires `set_tenant`.
4. Once a tenant is selected, every HTTP request includes `X-Tenant: {slug}` header.
5. The `/tenants` endpoint itself is exempt from tenant requirement (used for discovery).

---

## 4. Complete Tool Reference (49 Tools)

### Pages (8 tools)

#### nksweb_list_pages
List CMS pages with optional filters. Returns id, name, url, content, type, status, SEO fields, navigation flags, and timestamps.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | enum | No | Filter by page type: `default`, `homepage`, `contact`, `gallery`, `pricing`, `team`, `faq`, `news`, `articles`, `video_gallery`, `product`, `features`, `templates`, `demo`, `nks-pricing` |
| `status` | 0 \| 1 | No | `0` = disabled/draft, `1` = active/published |
| `search` | string | No | Fulltext search in page name, URL slug, and HTML content |
| `lang` | string | No | ISO 639-1 language code (e.g. `"cs"`, `"en"`) |

---

#### nksweb_get_page
Get full details of a single page by ID including HTML content, extraData, SEO metadata, navigation settings, and timestamps.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Page ID |

---

#### nksweb_create_page
Create a new CMS page. The page type determines the rendering template. Status controls visibility.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name shown in navigation and headings |
| `url` | string | Yes | URL slug -- must be unique, lowercase, no spaces (e.g. `"about-us"`) |
| `content` | string | No | HTML content of the page body |
| `type` | enum | No | Page template type (see `list_pages` for values) |
| `status` | 0 \| 1 | No | `0` = draft, `1` = published |
| `metaTitle` | string | No | SEO title tag |
| `metaDescription` | string | No | SEO meta description |
| `extraData` | object | No | JSON structured page data. For homepage: text in `content_blocks`, arrays in top-level keys (`benefits_items[]`, `pricing_models[]`, etc.). Set to `null` to clear. |
| `position` | number | No | Display order (lower = first, default: 0) |
| `showInMenu` | boolean | No | Show in main navigation menu |
| `showInNavbar` | boolean | No | Show in top navbar |
| `showInFooter` | boolean | No | Show in footer navigation |
| `lang` | string | No | Language code ISO 639-1 |

---

#### nksweb_update_page
Partial update -- only send fields to change. Omitted fields keep current values.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Page ID |
| (all `create_page` fields) | | No | Any field from create_page can be updated |

---

#### nksweb_delete_page
Soft-delete a page by ID. The page won't appear in listings but remains in the database. Cannot be undone via API.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Page ID |

---

#### nksweb_list_content_blocks
List all named content blocks for a page. Content blocks are text sections stored in `extraData.content_blocks`, editable via Quill editors in admin. Returns key, label, and HTML content for each block.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `pageId` | number | Yes | Page ID |

---

#### nksweb_upsert_content_block
Create or update a single content block on a page. If the block key exists, it is updated; otherwise created. Preserves all other blocks and extraData keys.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `pageId` | number | Yes | Page ID |
| `key` | string | Yes | Block key -- snake_case identifier (e.g. `"hero_heading"`, `"cta_description"`) |
| `content` | string | Yes | HTML content of the block |
| `label` | string | No | Human-readable label shown in admin (defaults to key) |

---

#### nksweb_delete_content_block
Delete a single content block from a page by key. Template falls back to hardcoded default text. Preserves other blocks.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `pageId` | number | Yes | Page ID |
| `key` | string | Yes | Block key to delete (e.g. `"hero_heading"`) |

---

### Articles (5 tools)

#### nksweb_list_articles
List all blog/news articles. Returns id, name, url, descriptionShort, status, lang, categoryIds, and timestamps.

**Parameters:** None

---

#### nksweb_get_article
Get full article details including HTML content, categories, SEO metadata, and timestamps.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Article ID |

---

#### nksweb_create_article
Create a new blog article. Link to categories via `categoryIds` array.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Article title |
| `url` | string | Yes | URL slug -- unique, lowercase (e.g. `"my-first-post"`) |
| `descriptionShort` | string | No | Short excerpt for listings and cards |
| `description` | string | No | Full article content in HTML |
| `status` | 0 \| 1 | No | `0` = draft, `1` = published |
| `metaTitle` | string | No | SEO title tag |
| `metaDescription` | string | No | SEO meta description |
| `lang` | string | No | Language code ISO 639-1 |
| `categoryIds` | number[] | No | Array of category IDs to assign |

---

#### nksweb_update_article
Partial update -- only send fields to change.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Article ID |
| (all `create_article` fields) | | No | Any field from create_article |

---

#### nksweb_delete_article
Soft-delete an article by ID. Cannot be undone via API.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Article ID |

---

### Categories (5 tools)

Categories use a nested tree structure. Root categories have `parentId = null`, subcategories reference their parent's ID.

#### nksweb_list_categories
List all article categories with their tree structure.

**Parameters:** None

---

#### nksweb_get_category
Get category details including title, description, and parent reference.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Category ID |

---

#### nksweb_create_category
Create a new category. Set `parentId` for subcategory, omit for root.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Category display name (max 64 chars) |
| `description` | string | No | Category description text |
| `parentId` | number | No | Parent category ID for nesting (null = root) |

---

#### nksweb_update_category
Update category. Changing `parentId` restructures the tree.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Category ID |
| `title` | string | No | Category display name |
| `description` | string | No | Category description |
| `parentId` | number | No | New parent ID (restructures tree) |

---

#### nksweb_delete_category
Delete a category. Articles assigned to it will lose the association.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Category ID |

---

### News (5 tools)

News items are time-based content like announcements, updates, or press releases.

#### nksweb_list_news
List all news/announcement items. Returns id, name, url, published status, and timestamps.

**Parameters:** None

---

#### nksweb_get_news_item
Get full news item details including HTML content and publication status.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | News item ID |

---

#### nksweb_create_news
Create a new news item.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | News headline/title |
| `url` | string | Yes | URL slug -- unique (e.g. `"new-feature-released"`) |
| `content` | string | No | Full news content in HTML |
| `published` | boolean | No | `true` = visible, `false` = hidden draft |

---

#### nksweb_update_news
Update a news item. Only send fields to change.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | News item ID |
| `name` | string | No | News headline/title |
| `url` | string | No | URL slug |
| `content` | string | No | Full news content in HTML |
| `published` | boolean | No | `true` = visible, `false` = hidden draft |

---

#### nksweb_delete_news
Permanently delete a news item. Cannot be undone.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | News item ID |

---

### Files (3 tools)

Files are images, documents, or other media uploaded through the CMS admin.

#### nksweb_list_files
List all uploaded files/media. Returns id, name, fileName (stored name), mimeType, fileSize, and timestamps.

**Parameters:** None

---

#### nksweb_get_file
Get file metadata by ID including original name, stored filename, MIME type, file size in bytes, and upload timestamp.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | File ID |

---

#### nksweb_delete_file
Permanently delete a file and its physical storage. Any pages/articles referencing it will have broken links. Cannot be undone.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | File ID |

---

### Users (5 tools)

Admin users for the CMS backend. Passwords are hashed server-side and never exposed in responses.

#### nksweb_list_users
List all admin users. Returns id, name, username, and role. Sensitive fields (password, tokens) excluded.

**Parameters:** None

---

#### nksweb_get_user
Get user profile by ID. Returns name, username, role, and timestamps.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | User ID |

---

#### nksweb_create_user
Create a new admin user.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | Login username -- must be unique across the tenant |
| `password` | string | Yes | Login password -- hashed server-side |
| `name` | string | No | Display name shown in admin UI |
| `role` | number | No | `0` = Admin (full access), `1` = Moderator (limited access) |

---

#### nksweb_update_user
Update user profile. Send only fields to change.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | User ID |
| `username` | string | No | Login username |
| `password` | string | No | New password (hashed server-side) |
| `name` | string | No | Display name |
| `role` | number | No | `0` = Admin, `1` = Moderator |

---

#### nksweb_delete_user
Permanently delete a user account. Immediate loss of access. Cannot be undone.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | User ID |

---

### Messages (4 tools)

Contact form submissions from website visitors. Messages are sorted newest first.

#### nksweb_list_messages
List all contact form submissions. Returns id, name, email, phone, subject, message body, isRead flag, and timestamps.

**Parameters:** None

---

#### nksweb_get_message
Get full message details including sender name, email, phone, subject, body, IP address, read status, and timestamps.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Message ID |

---

#### nksweb_mark_message_read
Mark a contact message as read or unread.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Message ID |
| `read` | boolean | No | `true` = read (default), `false` = unread |

---

#### nksweb_delete_message
Permanently delete a contact message. Cannot be undone.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Message ID |

---

### Redirects (5 tools)

URL redirect rules to handle moved/renamed pages, prevent broken links, and preserve SEO.

#### nksweb_list_redirects
List all URL redirect rules. Returns oldUrl, newUrl, statusCode, active flag, hitCount, and timestamps.

**Parameters:** None

---

#### nksweb_get_redirect
Get redirect rule details including hit count and last hit timestamp.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Redirect ID |

---

#### nksweb_create_redirect
Create a URL redirect rule.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `oldUrl` | string | Yes | Source URL path to redirect from (e.g. `"old-page"`) |
| `newUrl` | string | Yes | Target URL to redirect to (e.g. `"/new-page"` or full URL) |
| `statusCode` | number | No | `301` = permanent (default), `302` = temporary, `307` = temporary-preserve-method |
| `active` | boolean | No | `true` = active (default), `false` = disabled |
| `note` | string | No | Internal admin note about why this redirect exists |

---

#### nksweb_update_redirect
Update a redirect rule. Send only fields to change.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Redirect ID |
| `oldUrl` | string | No | Source URL path |
| `newUrl` | string | No | Target URL |
| `statusCode` | number | No | `301`, `302`, or `307` |
| `active` | boolean | No | Enable/disable the redirect |
| `note` | string | No | Internal admin note |

---

#### nksweb_delete_redirect
Delete a redirect rule. The old URL will return 404 after deletion.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Redirect ID |

---

### Settings (3 tools)

Key-value configuration for the tenant: site name, contact info, social links, analytics IDs, theme settings, feature flags.

#### nksweb_list_settings
List all tenant settings as key-value pairs.

**Parameters:** None

---

#### nksweb_get_setting
Get a specific setting value by its key.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | string | Yes | Setting key (e.g. `"site_name"`, `"contact_email"`, `"rybbit_enabled"`, `"rybbit_site_id"`) |

---

#### nksweb_update_settings
Update one or more settings at once. Only specified keys are changed.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `settings` | Record<string, string> | Yes | Object with key-value pairs, e.g. `{"site_name": "My Site", "contact_email": "info@example.com"}` |

---

### Analytics (4 tools)

Web analytics powered by the same backend as Rybbit Analytics. All analytics tools accept optional date range parameters.

**Common parameters for all analytics tools:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `startDate` | string | No | Start date `YYYY-MM-DD` (default: 30 days ago) |
| `endDate` | string | No | End date `YYYY-MM-DD` (default: today) |

#### nksweb_analytics_overview
Aggregated traffic stats: sessions, pageviews, unique users, pages/session, bounce rate (%), average session duration (seconds).

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `startDate` | string | No | Start date `YYYY-MM-DD` |
| `endDate` | string | No | End date `YYYY-MM-DD` |

---

#### nksweb_analytics_pages
Top visited pages ranked by visit count. Returns page path, visit count, pageviews, traffic percentage, average time on page, and bounce rate.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `startDate` | string | No | Start date `YYYY-MM-DD` |
| `endDate` | string | No | End date `YYYY-MM-DD` |
| `limit` | number | No | Max results 1-100 (default: 10) |

---

#### nksweb_analytics_referrers
Top traffic sources ranked by visitor count. Returns referrer domain/URL, visit count, and percentage of total traffic.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `startDate` | string | No | Start date `YYYY-MM-DD` |
| `endDate` | string | No | End date `YYYY-MM-DD` |
| `limit` | number | No | Max results 1-100 (default: 10) |

---

#### nksweb_analytics_metric
Breakdown by any of 14 analytics dimensions. Returns ranked list of values with visit counts and percentages.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `metric` | enum | Yes | Dimension: `pathname`, `referrer`, `country`, `region`, `city`, `browser`, `os`, `device_type`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `language` |
| `startDate` | string | No | Start date `YYYY-MM-DD` |
| `endDate` | string | No | End date `YYYY-MM-DD` |
| `limit` | number | No | Max results 1-100 (default: 10) |

---

## 5. Workflow Recipes

### First-Time Setup
```
1. nksweb_list_tenants          -- see what tenants are available
2. nksweb_set_tenant { slug: "my-site" }  -- select the target tenant
3. nksweb_list_pages            -- explore existing pages
4. nksweb_list_settings         -- see site configuration
```

### Content Management
```
-- List all active pages
nksweb_list_pages { status: 1 }

-- Search for pages about pricing
nksweb_list_pages { search: "pricing" }

-- Get homepage by type
nksweb_list_pages { type: "homepage" }

-- Create a new FAQ page
nksweb_create_page { name: "FAQ", url: "faq", type: "faq", status: 1,
  content: "<h1>Frequently Asked Questions</h1><p>...</p>" }

-- Update page content
nksweb_update_page { id: 42, content: "<h1>Updated content</h1>" }

-- Publish a draft page
nksweb_update_page { id: 42, status: 1 }
```

### Content Blocks (Homepage Sections)
```
-- List all content blocks on the homepage
nksweb_list_content_blocks { pageId: 14 }

-- Update the hero heading
nksweb_upsert_content_block { pageId: 14, key: "hero_heading",
  content: "Digital Solutions That Work", label: "Hero Heading" }

-- Delete a content block (falls back to template default)
nksweb_delete_content_block { pageId: 14, key: "old_section" }
```

### Articles & Categories
```
-- Create a category hierarchy
nksweb_create_category { title: "Technology" }          -- returns id: 1
nksweb_create_category { title: "AI", parentId: 1 }     -- subcategory

-- Create an article in a category
nksweb_create_article { name: "New Feature Launch", url: "new-feature",
  description: "<p>We are excited to...</p>", status: 1, categoryIds: [1] }

-- Update article categories
nksweb_update_article { id: 5, categoryIds: [1, 2] }
```

### Analytics
```
-- Traffic overview for the current month
nksweb_analytics_overview { startDate: "2026-03-01" }

-- Top 5 pages
nksweb_analytics_pages { limit: 5 }

-- Where is traffic coming from?
nksweb_analytics_referrers {}

-- Browser breakdown
nksweb_analytics_metric { metric: "browser", limit: 10 }

-- Country distribution for last week
nksweb_analytics_metric { metric: "country",
  startDate: "2026-03-16", endDate: "2026-03-23" }

-- UTM campaign analysis
nksweb_analytics_metric { metric: "utm_campaign" }
```

### User Management
```
-- List current admin users
nksweb_list_users

-- Create a moderator account
nksweb_create_user { username: "editor", password: "securePass123",
  name: "Content Editor", role: 1 }

-- Promote to admin
nksweb_update_user { id: 3, role: 0 }
```

### Redirects & SEO
```
-- Set up a redirect for a renamed page
nksweb_create_redirect { oldUrl: "old-page", newUrl: "/new-page",
  statusCode: 301, active: true, note: "Page renamed 2026-03" }

-- Check which redirects are being hit
nksweb_list_redirects
nksweb_get_redirect { id: 1 }   -- shows hitCount
```

### Contact Messages
```
-- Check new messages
nksweb_list_messages

-- Read a specific message
nksweb_get_message { id: 7 }

-- Mark as reviewed
nksweb_mark_message_read { id: 7 }
```

### Multi-Tenant Operations
```
-- List all tenants (SuperAdmin key)
nksweb_list_tenants

-- Switch to a tenant
nksweb_set_tenant { slug: "acme" }

-- Now all operations target "acme"
nksweb_list_pages
nksweb_analytics_overview

-- Switch to another tenant
nksweb_set_tenant { slug: "other-site" }

-- Clear tenant context
nksweb_set_tenant { slug: "" }
```

---

## 6. Tips & Gotchas

- **Tenant auto-detection:** If the API key has access to only 1 tenant, it is auto-selected at startup. No `set_tenant` needed.
- **Multi-tenant guard:** If the API key has access to multiple tenants and none is selected, all non-tenant tools will return an error listing available tenants. Always call `set_tenant` first.
- **Partial updates:** Update tools (pages, articles, news, etc.) use partial semantics -- only send fields you want to change. Omitted fields keep current values.
- **Content is HTML:** Page content, article descriptions, news content, and content blocks all expect HTML strings.
- **Page types are fixed:** The `type` enum is hardcoded -- `default`, `homepage`, `contact`, `gallery`, `pricing`, `team`, `faq`, `news`, `articles`, `video_gallery`, `product`, `features`, `templates`, `demo`, `nks-pricing`.
- **Status values:** Pages and articles use `0` = disabled/draft, `1` = active/published. News uses `published: boolean` instead.
- **Categories are tree-structured:** Use `parentId` to create nested hierarchies. Deleting a parent may orphan children.
- **Content blocks vs extraData:** Text content on pages (especially homepage) lives in `extraData.content_blocks`. Use the content block tools for text edits. Use `extraData` directly only for structural arrays (benefits, pricing models, etc.).
- **Analytics dimensions match Rybbit:** The analytics backend is shared with Rybbit Analytics. All 14 dimensions (`pathname`, `referrer`, `country`, `region`, `city`, `browser`, `os`, `device_type`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `language`) are available.
- **Analytics date defaults:** Without `startDate`/`endDate`, analytics tools default to the last 30 days.
- **Response truncation:** Large responses are automatically truncated at 25,000 characters. Arrays are halved with a truncation message. Use filters or pagination to narrow results.
- **Request timeout:** All API calls have a 30-second timeout.
- **Soft deletes:** Pages and articles use soft-delete -- they remain in the database but won't appear in listings.
- **File deletion is permanent:** Unlike pages/articles, file deletion removes physical storage. References become broken.
- **Redirect hit counts:** Each redirect tracks how many times it has been triggered -- useful for auditing.
- **API scopes:** The API key must have appropriate scopes (e.g. `pages:read`, `pages:write`, `analytics:read`). Missing scopes return 403.
