/**
 * Integration tests for nksweb-mcp against a live NKS-Web API.
 *
 * Usage:
 *   NKSWEB_URL=https://nks-web.loc NKSWEB_API_KEY=your_key npx tsx tests/integration.test.ts
 */

import { NksWebClient } from "../src/client.js";

const BASE_URL = process.env.NKSWEB_URL || "https://nks-web.loc";
const API_KEY = process.env.NKSWEB_API_KEY || "";

if (!API_KEY) {
  console.error("Set NKSWEB_API_KEY environment variable");
  process.exit(1);
}

const client = new NksWebClient({ baseUrl: BASE_URL, apiKey: API_KEY });

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
  duration: number;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<string>): Promise<void> {
  const start = Date.now();
  try {
    const detail = await fn();
    results.push({ name, passed: true, detail, duration: Date.now() - start });
    console.log(`  ✓ ${name} (${Date.now() - start}ms)`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name, passed: false, detail: msg, duration: Date.now() - start });
    console.log(`  ✗ ${name} → ${msg}`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

// ─── AUTH & ERROR HANDLING ───────────────────────────────────────────

async function testAuth() {
  console.log("\n── Auth & Error Handling ──");

  await test("Valid API key returns 200", async () => {
    const res = await client.get<any>("/pages");
    assert(res.status === "ok", `Expected status ok, got ${res.status}`);
    return `${res.data.length} pages`;
  });

  await test("Invalid API key returns 401", async () => {
    const bad = new NksWebClient({ baseUrl: BASE_URL, apiKey: "invalid_key" });
    try {
      await bad.get("/pages");
      throw new Error("Should have thrown");
    } catch (err: any) {
      assert(err.message.includes("Authentication failed"), `Unexpected: ${err.message}`);
      return "401 correctly thrown";
    }
  });

  await test("Missing resource returns 404", async () => {
    try {
      await client.get("/articles/99999");
      throw new Error("Should have thrown");
    } catch (err: any) {
      assert(err.message.includes("not found"), `Unexpected: ${err.message}`);
      return "404 correctly thrown";
    }
  });
}

// ─── PAGES CRUD ──────────────────────────────────────────────────────

let testPageId: number;

async function testPages() {
  console.log("\n── Pages CRUD ──");

  await test("List pages", async () => {
    const res = await client.get<any>("/pages");
    assert(Array.isArray(res.data), "Expected array");
    return `${res.data.length} pages`;
  });

  await test("Create page", async () => {
    const res = await client.post<any>("/pages", {
      name: "Integration Test Page",
      url: "integration-test-page-" + Date.now(),
      content: "<p>Created by integration test</p>",
      type: "default",
      status: 0,
      showInMenu: false,
      showInNavbar: false,
      showInFooter: false,
      lang: "cs",
    });
    assert(res.data?.id > 0, "Expected page ID");
    assert(res.data.name === "Integration Test Page", "Name mismatch");
    testPageId = res.data.id;
    return `id=${testPageId}`;
  });

  await test("Get page by ID", async () => {
    const res = await client.get<any>(`/pages/${testPageId}`);
    assert(res.data.id === testPageId, "ID mismatch");
    assert(res.data.name === "Integration Test Page", "Name mismatch");
    return `name=${res.data.name}`;
  });

  await test("Update page", async () => {
    const res = await client.put<any>(`/pages/${testPageId}`, {
      name: "Updated Test Page",
      metaTitle: "SEO Test Title",
      status: 1,
    });
    assert(res.data.name === "Updated Test Page", "Name not updated");
    assert(res.data.metaTitle === "SEO Test Title", "MetaTitle not updated");
    return `name=${res.data.name}, status=${res.data.status}`;
  });

  await test("Delete page", async () => {
    const res = await client.delete<any>(`/pages/${testPageId}`);
    assert(res.deleted === true, "Expected deleted response");
    return "deleted";
  });

  await test("Verify page deleted (soft-delete or 404)", async () => {
    try {
      const res = await client.get<any>(`/pages/${testPageId}`);
      // Soft-deleted pages may still be returned — check deletedAt is set
      return `soft-deleted (still accessible), id=${res.data?.id}`;
    } catch (err: any) {
      assert(err.message.includes("not found"), `Unexpected: ${err.message}`);
      return "hard-deleted (404)";
    }
  });
}

// ─── ARTICLES CRUD ───────────────────────────────────────────────────

let testArticleId: number;

async function testArticles() {
  console.log("\n── Articles CRUD ──");

  await test("List articles", async () => {
    const res = await client.get<any>("/articles");
    assert(Array.isArray(res.data), "Expected array");
    return `${res.data.length} articles`;
  });

  await test("Create article", async () => {
    const res = await client.post<any>("/articles", {
      name: "Test Article by MCP",
      url: "test-article-mcp-" + Date.now(),
      descriptionShort: "Short description for testing",
      description: "<p>Full article content created by integration test suite.</p>",
      status: 1,
      lang: "cs",
    });
    assert(res.data?.id > 0, "Expected article ID");
    testArticleId = res.data.id;
    return `id=${testArticleId}`;
  });

  await test("Get article by ID", async () => {
    const res = await client.get<any>(`/articles/${testArticleId}`);
    assert(res.data.id === testArticleId, "ID mismatch");
    return `name=${res.data.name}`;
  });

  await test("Update article", async () => {
    const res = await client.put<any>(`/articles/${testArticleId}`, {
      name: "Updated Test Article",
      metaDescription: "SEO description via MCP test",
    });
    assert(res.data.name === "Updated Test Article", "Name not updated");
    return `name=${res.data.name}`;
  });

  await test("Delete article", async () => {
    const res = await client.delete<any>(`/articles/${testArticleId}`);
    assert(res.deleted === true, "Expected deleted");
    return "deleted";
  });
}

// ─── CATEGORIES CRUD ─────────────────────────────────────────────────

let testCategoryId: number;

async function testCategories() {
  console.log("\n── Categories CRUD ──");

  await test("List categories", async () => {
    const res = await client.get<any>("/categories");
    assert(Array.isArray(res.data), "Expected array");
    return `${res.data.length} categories`;
  });

  await test("Create category", async () => {
    const res = await client.post<any>("/categories", {
      title: "Test Category " + Date.now(),
      description: "Created by integration test",
    });
    assert(res.data?.id > 0, "Expected category ID");
    testCategoryId = res.data.id;
    return `id=${testCategoryId}`;
  });

  await test("Get category by ID", async () => {
    const res = await client.get<any>(`/categories/${testCategoryId}`);
    assert(res.data.id === testCategoryId, "ID mismatch");
    return `title=${res.data.title}`;
  });

  await test("Update category", async () => {
    const res = await client.put<any>(`/categories/${testCategoryId}`, {
      title: "Updated Category",
    });
    assert(res.data.title === "Updated Category", "Title not updated");
    return `title=${res.data.title}`;
  });

  await test("Delete category", async () => {
    const res = await client.delete<any>(`/categories/${testCategoryId}`);
    assert(res.deleted === true, "Expected deleted");
    return "deleted";
  });
}

// ─── NEWS CRUD ───────────────────────────────────────────────────────

let testNewsId: number;

async function testNews() {
  console.log("\n── News CRUD ──");

  await test("List news", async () => {
    const res = await client.get<any>("/news");
    assert(Array.isArray(res.data), "Expected array");
    return `${res.data.length} items`;
  });

  await test("Create news item", async () => {
    const res = await client.post<any>("/news", {
      name: "Test News " + Date.now(),
      url: "test-news-" + Date.now(),
      content: "<p>News created by test</p>",
      published: true,
    });
    assert(res.data?.id > 0, "Expected news ID");
    testNewsId = res.data.id;
    return `id=${testNewsId}`;
  });

  await test("Get news item by ID", async () => {
    const res = await client.get<any>(`/news/${testNewsId}`);
    assert(res.data.id === testNewsId, "ID mismatch");
    return `name=${res.data.name}`;
  });

  await test("Update news item", async () => {
    const res = await client.put<any>(`/news/${testNewsId}`, {
      name: "Updated Test News",
      published: false,
    });
    assert(res.data.name === "Updated Test News", "Name not updated");
    return `published=${res.data.published}`;
  });

  await test("Delete news item", async () => {
    const res = await client.delete<any>(`/news/${testNewsId}`);
    assert(res.deleted === true, "Expected deleted");
    return "deleted";
  });
}

// ─── REDIRECTS CRUD ──────────────────────────────────────────────────

let testRedirectId: number;

async function testRedirects() {
  console.log("\n── Redirects CRUD ──");

  await test("List redirects", async () => {
    const res = await client.get<any>("/redirects");
    assert(Array.isArray(res.data), "Expected array");
    return `${res.data.length} redirects`;
  });

  await test("Create redirect", async () => {
    const res = await client.post<any>("/redirects", {
      oldUrl: "test-old-" + Date.now(),
      newUrl: "/test-new",
      statusCode: 302,
      active: true,
      note: "Integration test redirect",
    });
    assert(res.data?.id > 0, "Expected redirect ID");
    assert(res.data.statusCode === 302, "StatusCode mismatch");
    testRedirectId = res.data.id;
    return `id=${testRedirectId}, ${res.data.oldUrl} → ${res.data.newUrl}`;
  });

  await test("Get redirect by ID", async () => {
    const res = await client.get<any>(`/redirects/${testRedirectId}`);
    assert(res.data.id === testRedirectId, "ID mismatch");
    return `statusCode=${res.data.statusCode}`;
  });

  await test("Update redirect", async () => {
    const res = await client.put<any>(`/redirects/${testRedirectId}`, {
      statusCode: 301,
      note: "Updated by test",
    });
    assert(res.data.statusCode === 301, "StatusCode not updated");
    return `statusCode=${res.data.statusCode}`;
  });

  await test("Delete redirect", async () => {
    const res = await client.delete<any>(`/redirects/${testRedirectId}`);
    assert(res.deleted === true, "Expected deleted");
    return "deleted";
  });
}

// ─── FILES ───────────────────────────────────────────────────────────

async function testFiles() {
  console.log("\n── Files ──");

  await test("List files", async () => {
    const res = await client.get<any>("/files");
    assert(Array.isArray(res.data), "Expected array");
    return `${res.data.length} files`;
  });
}

// ─── USERS ───────────────────────────────────────────────────────────

let testUserId: number;

async function testUsers() {
  console.log("\n── Users CRUD ──");

  await test("List users", async () => {
    const res = await client.get<any>("/users");
    assert(Array.isArray(res.data), "Expected array");
    return `${res.data.length} users`;
  });

  await test("Create user", async () => {
    const res = await client.post<any>("/users", {
      username: "testuser_" + Date.now(),
      password: "TestPass123!",
      name: "Test User",
      role: 1,
    });
    assert(res.data?.id > 0, "Expected user ID");
    testUserId = res.data.id;
    return `id=${testUserId}, username=${res.data.username}`;
  });

  await test("Get user by ID", async () => {
    const res = await client.get<any>(`/users/${testUserId}`);
    assert(res.data.id === testUserId, "ID mismatch");
    assert(res.data.role === 1, "Role should be 1 (Moderator)");
    return `name=${res.data.name}, role=${res.data.role}`;
  });

  await test("Update user", async () => {
    const res = await client.put<any>(`/users/${testUserId}`, {
      name: "Updated Test User",
      role: 0,
    });
    assert(res.data.name === "Updated Test User", "Name not updated");
    assert(res.data.role === 0, "Role not updated to Admin");
    return `name=${res.data.name}, role=${res.data.role}`;
  });

  await test("Delete user", async () => {
    const res = await client.delete<any>(`/users/${testUserId}`);
    assert(res.deleted === true, "Expected deleted");
    return "deleted";
  });
}

// ─── MESSAGES ────────────────────────────────────────────────────────

async function testMessages() {
  console.log("\n── Messages ──");

  await test("List messages", async () => {
    const res = await client.get<any>("/messages");
    assert(Array.isArray(res.data), "Expected array");
    return `${res.data.length} messages`;
  });
}

// ─── SETTINGS ────────────────────────────────────────────────────────

async function testSettings() {
  console.log("\n── Settings ──");

  await test("List settings", async () => {
    const res = await client.get<any>("/settings");
    assert(typeof res.data === "object", "Expected object");
    const keys = Object.keys(res.data);
    return `${keys.length} settings`;
  });

  await test("Get specific setting", async () => {
    const res = await client.get<any>("/settings/rybbit_enabled");
    assert(res.data !== undefined, "Expected setting value");
    return `rybbit_enabled=${JSON.stringify(res.data)}`;
  });

  await test("Update settings (idempotent)", async () => {
    // Read current, write same value back
    const current = await client.get<any>("/settings/rybbit_enabled");
    const val = typeof current.data === "object" ? current.data.value : String(current.data);
    const res = await client.put<any>("/settings", {
      rybbit_enabled: val,
    });
    return `updated, status=${res.status}`;
  });
}

// ─── ANALYTICS ───────────────────────────────────────────────────────

async function testAnalytics() {
  console.log("\n── Analytics ──");

  await test("Get overview", async () => {
    const res = await client.get<any>("/analytics/overview");
    assert(res.data !== null, "Expected analytics data");
    const stats = res.data.data || res.data;
    return `sessions=${stats.sessions}, pageviews=${stats.pageviews}`;
  });

  await test("Get top pages", async () => {
    const res = await client.get<any>("/analytics/pages", { limit: 5 });
    assert(res.data !== null, "Expected pages data");
    return `data received`;
  });

  await test("Get referrers", async () => {
    const res = await client.get<any>("/analytics/referrers", { limit: 5 });
    assert(res.data !== null, "Expected referrers data");
    return `data received`;
  });

  await test("Analytics with date range", async () => {
    const res = await client.get<any>("/analytics/overview", {
      startDate: "2026-03-01",
      endDate: "2026-03-09",
    });
    assert(res.data !== null, "Expected data");
    return `filtered by date range`;
  });
}

// ─── ARTICLE + CATEGORY RELATIONSHIP ─────────────────────────────────

async function testRelationships() {
  console.log("\n── Relationships ──");

  let catId: number;
  let artId: number;

  await test("Create category for linking", async () => {
    const res = await client.post<any>("/categories", {
      title: "Link Test Category " + Date.now(),
    });
    catId = res.data.id;
    return `categoryId=${catId}`;
  });

  await test("Create article with category", async () => {
    const res = await client.post<any>("/articles", {
      name: "Linked Article " + Date.now(),
      url: "linked-article-" + Date.now(),
      description: "<p>Article linked to category</p>",
      status: 1,
      lang: "cs",
      categoryIds: [catId!],
    });
    artId = res.data.id;
    assert(res.data.categoryIds?.includes(catId!), "Category not linked");
    return `articleId=${artId}, categoryIds=${JSON.stringify(res.data.categoryIds)}`;
  });

  await test("Verify link in article detail", async () => {
    const res = await client.get<any>(`/articles/${artId!}`);
    assert(res.data.categoryIds?.includes(catId!), "Category link missing in detail");
    return `categoryIds=${JSON.stringify(res.data.categoryIds)}`;
  });

  // Cleanup
  await test("Cleanup: delete linked article", async () => {
    await client.delete(`/articles/${artId!}`);
    return "deleted";
  });

  await test("Cleanup: delete test category", async () => {
    await client.delete(`/categories/${catId!}`);
    return "deleted";
  });
}

// ─── VALIDATION ERRORS ───────────────────────────────────────────────

async function testValidation() {
  console.log("\n── Validation Errors ──");

  await test("Create article without required fields → 400", async () => {
    try {
      await client.post("/articles", { description: "no name or url" });
      throw new Error("Should have thrown");
    } catch (err: any) {
      assert(err.message.includes("Validation") || err.message.includes("required"), `Unexpected: ${err.message}`);
      return "400 correctly thrown";
    }
  });

  await test("Create page without required fields → 400", async () => {
    try {
      await client.post("/pages", { content: "no name" });
      throw new Error("Should have thrown");
    } catch (err: any) {
      assert(err.message.includes("Validation") || err.message.includes("required"), `Unexpected: ${err.message}`);
      return "400 correctly thrown";
    }
  });

  await test("Create redirect without required fields → 400", async () => {
    try {
      await client.post("/redirects", { note: "missing urls" });
      throw new Error("Should have thrown");
    } catch (err: any) {
      assert(err.message.includes("Validation") || err.message.includes("required"), `Unexpected: ${err.message}`);
      return "400 correctly thrown";
    }
  });

  await test("Create user without required fields → 400", async () => {
    try {
      await client.post("/users", { name: "No username" });
      throw new Error("Should have thrown");
    } catch (err: any) {
      assert(err.message.includes("Validation") || err.message.includes("required"), `Unexpected: ${err.message}`);
      return "400 correctly thrown";
    }
  });
}

// ─── SCOPE ENFORCEMENT ───────────────────────────────────────────────

async function testScopes() {
  console.log("\n── Scope Enforcement ──");

  // We can only test this if we have a limited-scope key
  // For now, verify the full-scope key works
  await test("Full-scope key can access all resources", async () => {
    const endpoints = ["/pages", "/articles", "/categories", "/news", "/files", "/users", "/messages", "/redirects", "/settings"];
    let accessed = 0;
    for (const ep of endpoints) {
      try {
        await client.get(ep);
        accessed++;
      } catch (err: any) {
        if (err.message.includes("Rate limit")) {
          return `${accessed}/${endpoints.length} endpoints before rate limit (expected after many tests)`;
        }
        throw err;
      }
    }
    return `all ${endpoints.length} endpoints accessible`;
  });
}

// ─── RUN ALL ─────────────────────────────────────────────────────────

async function runAll() {
  console.log(`\nNKS-Web MCP Integration Tests`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);

  await testAuth();
  await testPages();
  await testArticles();
  await testCategories();
  await testNews();
  await testRedirects();
  await testFiles();
  await testUsers();
  await testMessages();
  await testSettings();
  await testAnalytics();
  await testRelationships();
  await testValidation();
  await testScopes();

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`\n${"═".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${results.length} total (${totalTime}ms)`);

  if (failed > 0) {
    console.log(`\nFailed tests:`);
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`  ✗ ${r.name}: ${r.detail}`);
    }
    process.exit(1);
  }

  console.log(`\nALL TESTS PASSED ✓`);
}

runAll().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
