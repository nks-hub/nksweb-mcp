// Single-object tools return the whole API entity, which carries more fields than
// the output schemas list (extraData, author, tags, ...). A validating MCP client
// must accept it instead of failing with "Structured content does not match the
// tool's output schema". Runs against the compiled build: `npm run build` first.
import assert from "node:assert/strict";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createNksWebServer } from "../build/server.js";

const EXTRA = {
  extraData: { content_blocks: { intro: { label: "Intro", content: "<p>x</p>" } } },
  author: { id: 1, name: "Editor" },
  tags: ["news"],
  createdAt: "2026-11-24 10:00:00",
};

/** A value that satisfies a JSON Schema, filling in required properties only. */
function sample(schema = {}) {
  if (schema.enum) return schema.enum[0];
  if (schema.const !== undefined) return schema.const;
  if (schema.anyOf) return sample(schema.anyOf.find((s) => s.type !== "null") ?? schema.anyOf[0]);
  const type = Array.isArray(schema.type) ? schema.type.find((t) => t !== "null") : schema.type;
  switch (type) {
    case "number":
    case "integer":
      return 1;
    case "string":
      return "x";
    case "boolean":
      return true;
    case "array":
      return [];
    case "object":
      return Object.fromEntries((schema.required ?? []).map((key) => [key, sample(schema.properties[key])]));
    default:
      return null;
  }
}

test("get/create/update tools accept entities with fields the schema does not list", async () => {
  const originalFetch = globalThis.fetch;
  let entity;
  globalThis.fetch = async (input) => {
    const data = String(input).endsWith("/api/v1/tenants") ? [{ slug: "demo" }] : entity;
    return new Response(JSON.stringify({ status: "ok", data }), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  const server = await createNksWebServer({ baseUrl: "https://example.test", apiKey: "test-key" });
  const client = new Client({ name: "nksweb-test", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    // Listing tools makes the client validate structuredContent against each output schema.
    const tools = (await client.listTools()).tools.filter((t) => /^nksweb_(get|create|update)_/.test(t.name));
    assert.ok(tools.length >= 20, `expected the single-object tools, got ${tools.length}`);

    const passedThrough = [];
    for (const tool of tools) {
      entity = { ...sample(tool.outputSchema), ...EXTRA };
      const result = await client.callTool({ name: tool.name, arguments: sample(tool.inputSchema) });
      assert.ok(!result.isError, `${tool.name}: ${JSON.stringify(result.content)}`);
      if (result.structuredContent?.author) passedThrough.push(tool.name);
    }
    for (const name of ["page", "article", "category", "news", "redirect", "user"].flatMap((e) => [`nksweb_create_${e}`, `nksweb_update_${e}`])) {
      assert.ok(passedThrough.includes(name), `${name} did not return the entity's extra fields`);
    }
    assert.ok(passedThrough.includes("nksweb_get_page") && passedThrough.includes("nksweb_get_article"));
  } finally {
    globalThis.fetch = originalFetch;
    await client.close();
    await server.close();
  }
});
