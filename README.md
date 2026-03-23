# @nks-hub/nksweb-mcp

[![npm version](https://img.shields.io/npm/v/@nks-hub/nksweb-mcp.svg)](https://www.npmjs.com/package/@nks-hub/nksweb-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178c6.svg)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.27+-8b5cf6.svg)](https://modelcontextprotocol.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933.svg)](https://nodejs.org)

> MCP server pro [NKS-Web CMS](https://nks-hub.cz) — spravujte stránky, články, novinky, soubory, uživatele, analytiku a další přímo z Claude Code nebo jakéhokoliv MCP-kompatibilního klienta.

*[English version](README_EN.md)*

---

## Proč?

Místo přepínání mezi admin panely nechte AI asistenta spravovat CMS obsah přímo:

- "Vypiš všechny aktivní stránky"
- "Vytvoř nový článek o aktualizaci produktu"
- "Jaké jsou nejnavštěvovanější stránky tento měsíc?"
- "Ukaž rozdělení prohlížečů z analytiky"
- "Přepni na tenant acme a vypiš jejich novinky"

---

## Rychlý start

### Instalace

Žádná instalace není potřeba — stačí `npx`:

```bash
npx -y @nks-hub/nksweb-mcp
```

### Konfigurace

Přidejte do `~/.claude/.mcp.json` nebo projektové MCP konfigurace:

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

Nebo přes Claude Code CLI:

```bash
claude mcp add nksweb -e NKSWEB_URL=https://your-site.com -e NKSWEB_API_KEY=nks_key -- npx -y @nks-hub/nksweb-mcp
```

### Použití

Zeptejte se Claude Code na cokoliv ohledně vašeho CMS obsahu. Všechny nástroje jsou automaticky k dispozici.

---

## Funkce

| Funkce | Popis |
|--------|-------|
| **49 nástrojů** | Kompletní správa CMS — stránky, články, kategorie, novinky, soubory, uživatelé, zprávy, přesměrování, nastavení, analytika, tenanti |
| **Content bloky** | Vytváření, aktualizace a mazání pojmenovaných bloků obsahu na stránkách (kompatibilní s Quill editorem) |
| **Multi-tenant** | Výpis dostupných tenantů a přepínání kontextu pro správu dat libovolného tenanta |
| **Filtrování stránek** | Filtry podle typu, stavu, jazyka nebo fulltextové hledání v názvu/URL/obsahu |
| **Analytické metriky** | 14 analytických dimenzí — země, prohlížeče, zařízení, UTM kampaně a další |
| **Anotace nástrojů** | MCP anotace (readOnly, destructive, idempotent) pro bezpečné použití AI |
| **Zkracování odpovědí** | Automatické zkrácení na 25k znaků pro prevenci zahlcení kontextu |
| **Aktuální chyby** | Chybové zprávy podle HTTP statusu, které navigují LLM ke správnému použití |

---

## Proměnné prostředí

| Proměnná | Povinná | Popis |
|----------|---------|-------|
| `NKSWEB_URL` | Ano | Základní URL instance NKS-Web (např. `https://your-site.com`) |
| `NKSWEB_API_KEY` | Ano | API klíč s příslušnými oprávněními (prefix `nks_`) |

---

## Nástroje (49)

### Stránky (8 nástrojů)

| Nástroj | Popis |
|---------|-------|
| `nksweb_list_pages` | Výpis stránek s volitelnými filtry: `type`, `status`, `search`, `lang` |
| `nksweb_get_page` | Detail stránky podle ID včetně HTML obsahu a extraData |
| `nksweb_create_page` | Vytvoření nové stránky s obsahem, typem, SEO a nastavením navigace |
| `nksweb_update_page` | Aktualizace stránky (částečná — posílají se jen změněná pole) |
| `nksweb_delete_page` | Smazání stránky (soft-delete) |
| `nksweb_list_content_blocks` | Výpis všech pojmenovaných bloků obsahu stránky |
| `nksweb_upsert_content_block` | Vytvoření nebo aktualizace bloku obsahu podle klíče |
| `nksweb_delete_content_block` | Smazání bloku obsahu stránky |

### Články (5 nástrojů)

| Nástroj | Popis |
|---------|-------|
| `nksweb_list_articles` | Výpis všech článků |
| `nksweb_get_article` | Detail článku podle ID |
| `nksweb_create_article` | Vytvoření článku s obsahem, kategoriemi a SEO |
| `nksweb_update_article` | Aktualizace existujícího článku |
| `nksweb_delete_article` | Smazání článku |

### Kategorie (5 nástrojů)

| Nástroj | Popis |
|---------|-------|
| `nksweb_list_categories` | Výpis všech kategorií článků |
| `nksweb_get_category` | Detail kategorie podle ID |
| `nksweb_create_category` | Vytvoření kategorie (podpora vnořeného stromu) |
| `nksweb_update_category` | Aktualizace kategorie |
| `nksweb_delete_category` | Smazání kategorie |

### Novinky (5 nástrojů)

| Nástroj | Popis |
|---------|-------|
| `nksweb_list_news` | Výpis všech novinek |
| `nksweb_get_news_item` | Detail novinky podle ID |
| `nksweb_create_news` | Vytvoření novinky |
| `nksweb_update_news` | Aktualizace novinky |
| `nksweb_delete_news` | Smazání novinky |

### Soubory (3 nástroje)

| Nástroj | Popis |
|---------|-------|
| `nksweb_list_files` | Výpis všech nahraných souborů |
| `nksweb_get_file` | Metadata souboru podle ID |
| `nksweb_delete_file` | Smazání souboru |

### Uživatelé (5 nástrojů)

| Nástroj | Popis |
|---------|-------|
| `nksweb_list_users` | Výpis všech admin uživatelů |
| `nksweb_get_user` | Detail uživatele podle ID |
| `nksweb_create_user` | Vytvoření nového admin uživatele |
| `nksweb_update_user` | Aktualizace profilu nebo role uživatele |
| `nksweb_delete_user` | Smazání uživatele |

### Zprávy (4 nástroje)

| Nástroj | Popis |
|---------|-------|
| `nksweb_list_messages` | Výpis všech zpráv z kontaktního formuláře |
| `nksweb_get_message` | Detail zprávy podle ID |
| `nksweb_mark_message_read` | Označení zprávy jako přečtené/nepřečtené |
| `nksweb_delete_message` | Smazání zprávy |

### Přesměrování (5 nástrojů)

| Nástroj | Popis |
|---------|-------|
| `nksweb_list_redirects` | Výpis všech URL přesměrování |
| `nksweb_get_redirect` | Detail přesměrování podle ID |
| `nksweb_create_redirect` | Vytvoření pravidla přesměrování (301/302/307) |
| `nksweb_update_redirect` | Aktualizace přesměrování |
| `nksweb_delete_redirect` | Smazání přesměrování |

### Nastavení (3 nástroje)

| Nástroj | Popis |
|---------|-------|
| `nksweb_list_settings` | Výpis všech nastavení tenanta |
| `nksweb_get_setting` | Získání konkrétního nastavení podle klíče |
| `nksweb_update_settings` | Aktualizace jednoho nebo více nastavení |

### Analytika (4 nástroje)

| Nástroj | Popis |
|---------|-------|
| `nksweb_analytics_overview` | Přehled návštěvnosti — sessions, pageviews, uživatelé, bounce rate, průměrná doba |
| `nksweb_analytics_pages` | Nejnavštěvovanější stránky s počtem návštěv, pageviews, bounce rate |
| `nksweb_analytics_referrers` | Největší zdroje návštěvnosti s počtem návštěv a procentem |
| `nksweb_analytics_metric` | Rozdělení podle dimenze: `country`, `browser`, `os`, `device_type`, `city`, `region`, `language`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `pathname`, `referrer` |

### Tenanti (2 nástroje)

| Nástroj | Popis |
|---------|-------|
| `nksweb_list_tenants` | Výpis dostupných tenantů (multi-tenant klíč: všechny, single-tenant klíč: aktuální) |
| `nksweb_set_tenant` | Přepnutí aktivního tenanta — všechny následující operace cílí na něj |

---

## Oprávnění API klíče

API klíč potřebuje příslušná oprávnění pro nástroje, které chcete používat:

| Oprávnění | Nástroje |
|-----------|----------|
| `pages:read` | výpis, detail stránek a content bloků |
| `pages:write` | vytvoření, aktualizace, smazání stránek a content bloků |
| `articles:read` / `articles:write` | správa článků |
| `categories:read` / `categories:write` | správa kategorií |
| `news:read` / `news:write` | správa novinek |
| `files:read` / `files:write` | správa souborů |
| `users:read` / `users:write` | správa uživatelů |
| `messages:read` / `messages:write` | správa zpráv |
| `redirects:read` / `redirects:write` | správa přesměrování |
| `settings:read` / `settings:write` | správa nastavení |
| `analytics:read` | přístup k analytice |
| `tenants:read` | výpis tenantů |

---

## Filtrování stránek

Nástroj `nksweb_list_pages` podporuje tyto filtry:

| Parametr | Typ | Popis |
|----------|-----|-------|
| `type` | string | Filtr podle typu: `default`, `homepage`, `contact`, `gallery`, `pricing`, `team`, `faq`, `news`, `articles`, `video_gallery`, `product`, `features`, `templates`, `demo`, `nks-pricing` |
| `status` | number | `0` = neaktivní/koncept, `1` = aktivní/publikovaná |
| `search` | string | Fulltextové hledání v názvu stránky, URL slugu a HTML obsahu |
| `lang` | string | ISO 639-1 kód jazyka (např. `cs`, `en`) |

---

## Parametry analytiky

Všechny analytické nástroje přijímají volitelné parametry časového rozsahu:

| Parametr | Typ | Popis |
|----------|-----|-------|
| `startDate` | string | Počáteční datum `YYYY-MM-DD` (výchozí: před 30 dny) |
| `endDate` | string | Koncové datum `YYYY-MM-DD` (výchozí: dnes) |
| `limit` | number | Max výsledků 1–100 (výchozí: 10) |

### Dostupné metriky

Nástroj `nksweb_analytics_metric` podporuje tyto dimenze:

| Metrika | Popis |
|---------|-------|
| `pathname` | Cesty stránek (stejné jako top stránky) |
| `referrer` | Zdroje návštěvnosti |
| `country` | Země návštěvníků |
| `region` | Regiony/kraje návštěvníků |
| `city` | Města návštěvníků |
| `browser` | Názvy prohlížečů (Chrome, Firefox, Safari, …) |
| `os` | Operační systémy (Windows, macOS, iOS, Android, …) |
| `device_type` | Kategorie zařízení (desktop, mobile, tablet) |
| `language` | Nastavení jazyka prohlížeče |
| `utm_source` | UTM source parametr |
| `utm_medium` | UTM medium parametr |
| `utm_campaign` | UTM campaign parametr |
| `utm_content` | UTM content parametr |
| `utm_term` | UTM term parametr |

---

## Struktura projektu

```
nksweb-mcp/
├── src/
│   ├── index.ts          # Vstupní bod, nastavení MCP serveru
│   ├── client.ts         # HTTP klient s přepínáním tenantů (X-Tenant hlavička)
│   ├── constants.ts      # Timeouty a limity
│   └── tools/
│       ├── pages.ts      # Stránky + content bloky (8 nástrojů)
│       ├── articles.ts   # Články CRUD (5 nástrojů)
│       ├── categories.ts # Kategorie CRUD (5 nástrojů)
│       ├── news.ts       # Novinky CRUD (5 nástrojů)
│       ├── files.ts      # Správa souborů (3 nástroje)
│       ├── users.ts      # Uživatelé CRUD (5 nástrojů)
│       ├── messages.ts   # Správa zpráv (4 nástroje)
│       ├── redirects.ts  # Přesměrování CRUD (5 nástrojů)
│       ├── settings.ts   # Správa nastavení (3 nástroje)
│       ├── analytics.ts  # Analytické dotazy (4 nástroje)
│       └── tenants.ts    # Multi-tenant přepínání (2 nástroje)
├── tests/
│   └── integration.test.ts
├── build/                # Zkompilovaný JS výstup
├── package.json
├── tsconfig.json
└── LICENSE
```

---

## Příklady

### Správa obsahu

```
Uživatel: "Vypiš všechny aktivní stránky"
→ nksweb_list_pages { status: 1 }

Uživatel: "Najdi stránky obsahující 'pricing'"
→ nksweb_list_pages { search: "pricing" }

Uživatel: "Ukaž mi homepage"
→ nksweb_list_pages { type: "homepage" }

Uživatel: "Vytvoř novou FAQ stránku"
→ nksweb_create_page { name: "FAQ", url: "faq", type: "faq", status: 1,
    content: "<h1>Často kladené otázky</h1>" }

Uživatel: "Aktualizuj hero nadpis na homepage"
→ nksweb_upsert_content_block { pageId: 14, key: "hero_heading",
    content: "Digitální řešení, která fungují", label: "Hero Heading" }
```

### Analytika

```
Uživatel: "Jak je na tom návštěvnost tento měsíc?"
→ nksweb_analytics_overview { startDate: "2026-03-01" }

Uživatel: "Jaké prohlížeče používají naši návštěvníci?"
→ nksweb_analytics_metric { metric: "browser", limit: 10 }

Uživatel: "Ukaž rozdělení podle zemí za poslední týden"
→ nksweb_analytics_metric { metric: "country",
    startDate: "2026-03-02", endDate: "2026-03-09" }

Uživatel: "Top 5 nejnavštěvovanějších stránek"
→ nksweb_analytics_pages { limit: 5 }

Uživatel: "Odkud nám chodí návštěvnost?"
→ nksweb_analytics_referrers {}
```

### Multi-tenant

```
Uživatel: "Jací tenanti jsou k dispozici?"
→ nksweb_list_tenants {}

Uživatel: "Přepni na tenant acme"
→ nksweb_set_tenant { slug: "acme" }

Uživatel: "Teď vypiš jejich stránky"
→ nksweb_list_pages {}  (automaticky cílí na acme)

Uživatel: "Vrať se na výchozí"
→ nksweb_set_tenant { slug: "" }
```

### Články a novinky

```
Uživatel: "Vytvoř článek o naší nové funkci"
→ nksweb_create_article { title: "Představujeme chytré vyhledávání",
    url: "predstavujeme-chytre-vyhledavani", status: 1,
    content: "<p>S radostí oznamujeme...</p>" }

Uživatel: "Vypiš všechny novinky"
→ nksweb_list_news {}

Uživatel: "Smaž novinku #5"
→ nksweb_delete_news { id: 5 }
```

### Nastavení a přesměrování

```
Uživatel: "Jaká nastavení má tento tenant?"
→ nksweb_list_settings {}

Uživatel: "Přidej přesměrování z /stara-stranka na /nova-stranka"
→ nksweb_create_redirect { source: "/stara-stranka", target: "/nova-stranka",
    statusCode: 301, isActive: true }

Uživatel: "Ukaž všechny zprávy z kontaktního formuláře"
→ nksweb_list_messages {}
```

---

## Vývoj (ze zdrojového kódu)

```bash
git clone https://github.com/nks-hub/nksweb-mcp.git
cd nksweb-mcp

# Instalace závislostí
npm install

# Build
npm run build

# Watch mód
npm run dev

# Integrační testy
npm test

# Kontrola typů
npx tsc --noEmit
```

---

## Požadavky

- **Node.js**: 18+
- **NKS-Web CMS**: Instance se zapnutým API a vytvořeným API klíčem

---

## Přispívání

Příspěvky jsou vítány! Pro větší změny prosím nejdříve otevřete issue.

1. Forkujte repozitář
2. Vytvořte feature branch (`git checkout -b feature/skvela-funkce`)
3. Commitněte změny (`git commit -m 'feat: popis'`)
4. Pushujte branch (`git push origin feature/skvela-funkce`)
5. Otevřete Pull Request

---

## Podpora

- **Email:** dev@nks-hub.cz
- **Bug reporty:** [GitHub Issues](https://github.com/nks-hub/nksweb-mcp/issues)
- **MCP Protokol:** [modelcontextprotocol.io](https://modelcontextprotocol.io/)

---

## Licence

MIT License — viz [LICENSE](LICENSE).

---

## Odkazy

- [NKS-Web CMS](https://nks-hub.cz)
- [npm balíček](https://www.npmjs.com/package/@nks-hub/nksweb-mcp)
- [@nks-hub/rybbit-mcp](https://github.com/nks-hub/rybbit-mcp) — MCP server pro Rybbit Analytics
- [@nks-hub/rybbit-ts](https://github.com/nks-hub/rybbit-ts) — TypeScript tracking SDK

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/nks-hub">NKS Hub</a>
</p>
