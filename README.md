# @nks-hub/nksweb-mcp

[![npm version](https://img.shields.io/npm/v/@nks-hub/nksweb-mcp.svg)](https://www.npmjs.com/package/@nks-hub/nksweb-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178c6.svg)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.27+-8b5cf6.svg)](https://modelcontextprotocol.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933.svg)](https://nodejs.org)

> MCP server pro [NKS-Web CMS](https://nks-hub.cz) — spravujte stranky, clanky, novinky, soubory, uzivatele, analytiku a dalsi primo z Claude Code nebo jakehokoliv MCP-kompatibilniho klienta.

*[English version](README_EN.md)*

---

## Proc?

Misto prepinan mezi admin panely nechte AI asistenta spravovat CMS obsah primo:

- "Vypis vsechny aktivni stranky"
- "Vytvor novy clanek o aktualizaci produktu"
- "Jake jsou nejnavstevovanejsi stranky tento mesic?"
- "Ukaz rozdeleni prohlizecu z analytiky"
- "Prepni na tenant acme a vypis jejich novinky"

---

## Rychly start

### Instalace

```bash
npm install -g @nks-hub/nksweb-mcp
```

Nebo klonovanim a buildem:

```bash
git clone https://github.com/nks-hub/nksweb-mcp.git
cd nksweb-mcp
npm install && npm run build
```

### Konfigurace

Pridejte do `~/.claude/.mcp.json` nebo projektove MCP konfigurace:

```json
{
  "mcpServers": {
    "nksweb": {
      "command": "node",
      "args": ["/cesta/k/nksweb-mcp/build/index.js"],
      "env": {
        "NKSWEB_URL": "https://vas-web.cz",
        "NKSWEB_API_KEY": "nks_vas_api_klic"
      }
    }
  }
}
```

Nebo pres Claude Code CLI:

```bash
claude mcp add nksweb -e NKSWEB_URL=https://vas-web.cz -e NKSWEB_API_KEY=nks_vas_klic -- npx @nks-hub/nksweb-mcp
```

### Pouziti

Zeptejte se Claude Code na cokoliv ohledne vaseho CMS obsahu. Vsechny nastroje jsou automaticky k dispozici.

---

## Funkce

| Funkce | Popis |
|--------|-------|
| **49 nastroju** | Kompletni sprava CMS — stranky, clanky, kategorie, novinky, soubory, uzivatele, zpravy, presmerovani, nastaveni, analytika, tenanti |
| **Content bloky** | Vytvareni, aktualizace a mazani pojmenovanych bloku obsahu na strankach (kompatibilni s Quill editorem) |
| **Multi-tenant** | Vypis dostupnych tenantu a prepinani kontextu pro spravu dat libovolneho tenanta |
| **Filtrovani stranek** | Filtry podle typu, stavu, jazyka nebo fulltextove hledani v nazvu/URL/obsahu |
| **Analyticke metriky** | 14 analytickych dimenzi — zeme, prohlizece, zarizeni, UTM kampane a dalsi |
| **Anotace nastroju** | MCP anotace (readOnly, destructive, idempotent) pro bezpecne pouziti AI |
| **Zkracovani odpovedi** | Automaticke zkraceni na 25k znaku pro prevenci zahlteni kontextu |
| **Aktualni chyby** | Chybove zpravy podle HTTP statusu, ktere navigují LLM ke spravnemu pouziti |

---

## Promenne prostredi

| Promenna | Povinna | Popis |
|----------|---------|-------|
| `NKSWEB_URL` | Ano | Zakladni URL instance NKS-Web (napr. `https://vas-web.cz`) |
| `NKSWEB_API_KEY` | Ano | API klic s prislusnymi opravnenimi (prefix `nks_`) |

---

## Nastroje (49)

### Stranky (8 nastroju)

| Nastroj | Popis |
|---------|-------|
| `nksweb_list_pages` | Vypis stranek s volitelnymi filtry: `type`, `status`, `search`, `lang` |
| `nksweb_get_page` | Detail stranky podle ID vcetne HTML obsahu a extraData |
| `nksweb_create_page` | Vytvoreni nove stranky s obsahem, typem, SEO a nastavenim navigace |
| `nksweb_update_page` | Aktualizace stranky (casticna — posilaji se jen zmenena pole) |
| `nksweb_delete_page` | Smazani stranky (soft-delete) |
| `nksweb_list_content_blocks` | Vypis vsech pojmenovanych bloku obsahu stranky |
| `nksweb_upsert_content_block` | Vytvoreni nebo aktualizace bloku obsahu podle klice |
| `nksweb_delete_content_block` | Smazani bloku obsahu stranky |

### Clanky (5 nastroju)

| Nastroj | Popis |
|---------|-------|
| `nksweb_list_articles` | Vypis vsech clanku |
| `nksweb_get_article` | Detail clanku podle ID |
| `nksweb_create_article` | Vytvoreni clanku s obsahem, kategoriemi a SEO |
| `nksweb_update_article` | Aktualizace existujiciho clanku |
| `nksweb_delete_article` | Smazani clanku |

### Kategorie (5 nastroju)

| Nastroj | Popis |
|---------|-------|
| `nksweb_list_categories` | Vypis vsech kategorii clanku |
| `nksweb_get_category` | Detail kategorie podle ID |
| `nksweb_create_category` | Vytvoreni kategorie (podpora vnoreneho stromu) |
| `nksweb_update_category` | Aktualizace kategorie |
| `nksweb_delete_category` | Smazani kategorie |

### Novinky (5 nastroju)

| Nastroj | Popis |
|---------|-------|
| `nksweb_list_news` | Vypis vsech novinek |
| `nksweb_get_news_item` | Detail novinky podle ID |
| `nksweb_create_news` | Vytvoreni novinky |
| `nksweb_update_news` | Aktualizace novinky |
| `nksweb_delete_news` | Smazani novinky |

### Soubory (3 nastroje)

| Nastroj | Popis |
|---------|-------|
| `nksweb_list_files` | Vypis vsech nahranych souboru |
| `nksweb_get_file` | Metadata souboru podle ID |
| `nksweb_delete_file` | Smazani souboru |

### Uzivatele (5 nastroju)

| Nastroj | Popis |
|---------|-------|
| `nksweb_list_users` | Vypis vsech admin uzivatelu |
| `nksweb_get_user` | Detail uzivatele podle ID |
| `nksweb_create_user` | Vytvoreni noveho admin uzivatele |
| `nksweb_update_user` | Aktualizace profilu nebo role uzivatele |
| `nksweb_delete_user` | Smazani uzivatele |

### Zpravy (4 nastroje)

| Nastroj | Popis |
|---------|-------|
| `nksweb_list_messages` | Vypis vsech zprav z kontaktniho formulare |
| `nksweb_get_message` | Detail zpravy podle ID |
| `nksweb_mark_message_read` | Oznaceni zpravy jako prectene/neprectene |
| `nksweb_delete_message` | Smazani zpravy |

### Presmerovani (5 nastroju)

| Nastroj | Popis |
|---------|-------|
| `nksweb_list_redirects` | Vypis vsech URL presmerovani |
| `nksweb_get_redirect` | Detail presmerovani podle ID |
| `nksweb_create_redirect` | Vytvoreni pravidla presmerovani (301/302/307) |
| `nksweb_update_redirect` | Aktualizace presmerovani |
| `nksweb_delete_redirect` | Smazani presmerovani |

### Nastaveni (3 nastroje)

| Nastroj | Popis |
|---------|-------|
| `nksweb_list_settings` | Vypis vsech nastaveni tenanta |
| `nksweb_get_setting` | Ziskani konkretniho nastaveni podle klice |
| `nksweb_update_settings` | Aktualizace jednoho nebo vice nastaveni |

### Analytika (4 nastroje)

| Nastroj | Popis |
|---------|-------|
| `nksweb_analytics_overview` | Prehled navstevnosti — sessions, pageviews, uzivatele, bounce rate, prumerna doba |
| `nksweb_analytics_pages` | Nejnavstevovanejsi stranky s poctem navstev, pageviews, bounce rate |
| `nksweb_analytics_referrers` | Nejvetsi zdroje navstevnosti s poctem navstev a procentem |
| `nksweb_analytics_metric` | Rozdeleni podle dimenze: `country`, `browser`, `os`, `device_type`, `city`, `region`, `language`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `pathname`, `referrer` |

### Tenanti (2 nastroje)

| Nastroj | Popis |
|---------|-------|
| `nksweb_list_tenants` | Vypis dostupnych tenantu (multi-tenant klic: vsechny, single-tenant klic: aktualni) |
| `nksweb_set_tenant` | Prepnuti aktivniho tenanta — vsechny nasledujici operace cilí na nej |

---

## Opravneni API klice

API klic potrebuje prislusna opravneni pro nastroje, ktere chcete pouzivat:

| Opravneni | Nastroje |
|-----------|----------|
| `pages:read` | vypis, detail stranek a content bloku |
| `pages:write` | vytvoreni, aktualizace, smazani stranek a content bloku |
| `articles:read` / `articles:write` | sprava clanku |
| `categories:read` / `categories:write` | sprava kategorii |
| `news:read` / `news:write` | sprava novinek |
| `files:read` / `files:write` | sprava souboru |
| `users:read` / `users:write` | sprava uzivatelu |
| `messages:read` / `messages:write` | sprava zprav |
| `redirects:read` / `redirects:write` | sprava presmerovani |
| `settings:read` / `settings:write` | sprava nastaveni |
| `analytics:read` | pristup k analytice |
| `tenants:read` | vypis tenantu |

---

## Filtrovani stranek

Nastroj `nksweb_list_pages` podporuje tyto filtry:

| Parametr | Typ | Popis |
|----------|-----|-------|
| `type` | string | Filtr podle typu: `default`, `homepage`, `contact`, `gallery`, `pricing`, `team`, `faq`, `news`, `articles`, `video_gallery`, `product`, `features`, `templates`, `demo`, `nks-pricing` |
| `status` | number | `0` = neaktivni/koncept, `1` = aktivni/publikovana |
| `search` | string | Fulltextove hledani v nazvu stranky, URL slugu a HTML obsahu |
| `lang` | string | ISO 639-1 kod jazyka (napr. `cs`, `en`) |

---

## Parametry analytiky

Vsechny analyticke nastroje prijimaji volitelne parametry casoveho rozsahu:

| Parametr | Typ | Popis |
|----------|-----|-------|
| `startDate` | string | Pocatecni datum `YYYY-MM-DD` (vychozi: pred 30 dny) |
| `endDate` | string | Koncove datum `YYYY-MM-DD` (vychozi: dnes) |
| `limit` | number | Max vysledku 1–100 (vychozi: 10) |

### Dostupne metriky

Nastroj `nksweb_analytics_metric` podporuje tyto dimenze:

| Metrika | Popis |
|---------|-------|
| `pathname` | Cesty stranek (stejne jako top stranky) |
| `referrer` | Zdroje navstevnosti |
| `country` | Zeme navstevniku |
| `region` | Regiony/kraje navstevniku |
| `city` | Mesta navstevniku |
| `browser` | Nazvy prohlizecu (Chrome, Firefox, Safari, ...) |
| `os` | Operacni systemy (Windows, macOS, iOS, Android, ...) |
| `device_type` | Kategorie zarizeni (desktop, mobile, tablet) |
| `language` | Nastaveni jazyka prohlizece |
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
│   ├── index.ts          # Vstupni bod, nastaveni MCP serveru
│   ├── client.ts         # HTTP klient s prepinanim tenantu (X-Tenant hlavicka)
│   ├── constants.ts      # Timeouty a limity
│   └── tools/
│       ├── pages.ts      # Stranky + content bloky (8 nastroju)
│       ├── articles.ts   # Clanky CRUD (5 nastroju)
│       ├── categories.ts # Kategorie CRUD (5 nastroju)
│       ├── news.ts       # Novinky CRUD (5 nastroju)
│       ├── files.ts      # Sprava souboru (3 nastroje)
│       ├── users.ts      # Uzivatele CRUD (5 nastroju)
│       ├── messages.ts   # Sprava zprav (4 nastroje)
│       ├── redirects.ts  # Presmerovani CRUD (5 nastroju)
│       ├── settings.ts   # Sprava nastaveni (3 nastroje)
│       ├── analytics.ts  # Analyticke dotazy (4 nastroje)
│       └── tenants.ts    # Multi-tenant prepinani (2 nastroje)
├── tests/
│   └── integration.test.ts
├── build/                # Zkompilovany JS vystup
├── package.json
├── tsconfig.json
└── LICENSE
```

---

## Priklady

### Sprava obsahu

```
Uzivatel: "Vypis vsechny aktivni stranky"
→ nksweb_list_pages { status: 1 }

Uzivatel: "Najdi stranky obsahujici 'pricing'"
→ nksweb_list_pages { search: "pricing" }

Uzivatel: "Ukaz mi homepage"
→ nksweb_list_pages { type: "homepage" }

Uzivatel: "Vytvor novou FAQ stranku"
→ nksweb_create_page { name: "FAQ", url: "faq", type: "faq", status: 1,
    content: "<h1>Casto kladene otazky</h1>" }

Uzivatel: "Aktualizuj hero nadpis na homepage"
→ nksweb_upsert_content_block { pageId: 14, key: "hero_heading",
    content: "Digitalni reseni, ktera funguji", label: "Hero Heading" }
```

### Analytika

```
Uzivatel: "Jak je na tom navstevnost tento mesic?"
→ nksweb_analytics_overview { startDate: "2026-03-01" }

Uzivatel: "Jake prohlizece pouzivaji nasi navstevnici?"
→ nksweb_analytics_metric { metric: "browser", limit: 10 }

Uzivatel: "Ukaz rozdeleni podle zemi za posledni tyden"
→ nksweb_analytics_metric { metric: "country",
    startDate: "2026-03-02", endDate: "2026-03-09" }

Uzivatel: "Top 5 nejnavstevovanejsich stranek"
→ nksweb_analytics_pages { limit: 5 }

Uzivatel: "Odkud nam chodi navstevnost?"
→ nksweb_analytics_referrers {}
```

### Multi-tenant

```
Uzivatel: "Jaci tenanti jsou k dispozici?"
→ nksweb_list_tenants {}

Uzivatel: "Prepni na tenant acme"
→ nksweb_set_tenant { slug: "acme" }

Uzivatel: "Ted vypis jejich stranky"
→ nksweb_list_pages {}  (automaticky cili na acme)

Uzivatel: "Vrat se na vychozi"
→ nksweb_set_tenant { slug: "" }
```

### Clanky a novinky

```
Uzivatel: "Vytvor clanek o nasi nove funkci"
→ nksweb_create_article { title: "Predstavujeme chytre vyhledavani",
    url: "predstavujeme-chytre-vyhledavani", status: 1,
    content: "<p>S radosti oznamujeme...</p>" }

Uzivatel: "Vypis vsechny novinky"
→ nksweb_list_news {}

Uzivatel: "Smaz novinku #5"
→ nksweb_delete_news { id: 5 }
```

### Nastaveni a presmerovani

```
Uzivatel: "Jaka nastaveni ma tento tenant?"
→ nksweb_list_settings {}

Uzivatel: "Pridej presmerovani z /stara-stranka na /nova-stranka"
→ nksweb_create_redirect { source: "/stara-stranka", target: "/nova-stranka",
    statusCode: 301, isActive: true }

Uzivatel: "Ukaz vsechny zpravy z kontaktniho formulare"
→ nksweb_list_messages {}
```

---

## Vyvoj

```bash
# Instalace zavislosti
npm install

# Build
npm run build

# Watch mod
npm run dev

# Integracni testy
npm test

# Kontrola typu
npx tsc --noEmit
```

---

## Pozadavky

- **Node.js**: 18+
- **NKS-Web CMS**: Instance se zapnutym API a vytvorenym API klicem

---

## Prispivani

Prispevky jsou vitany! Pro vetsi zmeny prosim nejdrive otevrete issue.

1. Forkujte repozitar
2. Vytvorte feature branch (`git checkout -b feature/skvela-funkce`)
3. Commitnete zmeny (`git commit -m 'feat: popis'`)
4. Pushujte branch (`git push origin feature/skvela-funkce`)
5. Otevrete Pull Request

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
- [npm balicek](https://www.npmjs.com/package/@nks-hub/nksweb-mcp)
- [@nks-hub/rybbit-mcp](https://github.com/nks-hub/rybbit-mcp) — MCP server pro Rybbit Analytics
- [@nks-hub/rybbit-ts](https://github.com/nks-hub/rybbit-ts) — TypeScript tracking SDK

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/nks-hub">NKS Hub</a>
</p>
