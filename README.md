# @nks-hub/nksweb-mcp

[![npm version](https://img.shields.io/npm/v/@nks-hub/nksweb-mcp.svg)](https://www.npmjs.com/package/@nks-hub/nksweb-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933)](https://nodejs.org)

MCP server for **NKS-Web CMS** tenant management — manage pages, articles, news, redirects, users, analytics, and more via Claude Code or any MCP-compatible AI tool.

## Features

- **43 tools** for complete CMS tenant management
- Full CRUD for pages, articles, categories, news, files, users, messages, redirects
- Settings management and analytics dashboard
- Tool annotations (readOnly, destructive, idempotent hints)
- Response truncation for large datasets
- Actionable error messages with HTTP status context

## Quick Start

### Claude Code

```bash
claude mcp add nksweb-mcp -e NKSWEB_URL=https://your-site.com -e NKSWEB_API_KEY=your_key -- node /path/to/nksweb-mcp/build/index.js
```

### Manual Configuration

Add to your MCP settings (e.g. `~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "nksweb": {
      "command": "node",
      "args": ["/path/to/nksweb-mcp/build/index.js"],
      "env": {
        "NKSWEB_URL": "https://your-site.com",
        "NKSWEB_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NKSWEB_URL` | Yes | Base URL of the NKS-Web instance |
| `NKSWEB_API_KEY` | Yes | API key with appropriate scopes |

## Tools

### Pages (5 tools)
| Tool | Description |
|------|-------------|
| `nksweb_list_pages` | List all CMS pages |
| `nksweb_get_page` | Get page detail by ID |
| `nksweb_create_page` | Create a new page with content, type, SEO, and navigation settings |
| `nksweb_update_page` | Update an existing page |
| `nksweb_delete_page` | Delete a page |

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

### Analytics (3 tools)
| Tool | Description |
|------|-------------|
| `nksweb_analytics_overview` | Get traffic overview (sessions, pageviews, bounce rate, etc.) |
| `nksweb_analytics_pages` | Get top visited pages |
| `nksweb_analytics_referrers` | Get top traffic referrers |

## API Key Scopes

The API key needs appropriate scopes for the tools you want to use:

| Scope | Tools |
|-------|-------|
| `pages:read` | list, get pages |
| `pages:write` | create, update, delete pages |
| `articles:read` / `articles:write` | article management |
| `categories:read` / `categories:write` | category management |
| `news:read` / `news:write` | news management |
| `files:read` / `files:write` | file management |
| `users:read` / `users:write` | user management |
| `messages:read` / `messages:write` | message management |
| `redirects:read` / `redirects:write` | redirect management |
| `settings:read` / `settings:write` | settings management |
| `analytics:read` | analytics access |

## Development

```bash
git clone https://github.com/nks-hub/nksweb-mcp.git
cd nksweb-mcp
npm install
npm run build
```

## Support

- Issues: [GitHub Issues](https://github.com/nks-hub/nksweb-mcp/issues)
- Email: dev@nks-hub.cz

## License

[MIT](LICENSE)
