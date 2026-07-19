import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Service Switchboard MVP", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>IM2026 Service Switchboard<\/title>/i);
  assert.match(html, /See where you could serve Australia next\./);
  assert.match(html, /What work interests you\?/);
  assert.match(html, /Your background and desired next role\?/);
  assert.doesNotMatch(html, /What have you done—and what do you want more of\?/);
  assert.match(html, /Trades, facilities and logistics/);
  assert.doesNotMatch(html, /Show all 20 career areas|Show fewer areas/);
  assert.match(html, /Your switchboard to your next Australian Government job\./);
  assert.match(html, /Build my career map/);
  assert.match(html, /Go to Bot Card/);
  assert.match(html, /Bot card/);
  assert.match(html, /G’day! I’m Ollie/);
  assert.match(html, /Your guide/);
  assert.match(html, /Ollie the Koala operating the Service Switchboard/);
  assert.match(html, /Acknowledgement of Country/);
  assert.match(html, /linkedin\.com\/in\/bitpixi/);
  assert.match(html, /github\.com\/bitpixi2/);
  assert.match(html, /Inclusive Strategies Census Engagement Manager/);
  assert.match(html, /Bendigo, Australia/);
  assert.match(html, /US Citizen\. Full Australian working rights\./);
  assert.match(html, /Kasey\.Robinson@abs\.gov\.au/);
  assert.match(html, /koala-suitcase-sticker\.png/);
  assert.match(html, /koala-coffee-chat-sticker\.png/);
  assert.doesNotMatch(html, /koala-colleague-sticker\.png/);
  assert.match(html, /koala-high-vis-ute-sticker\.png/);
  assert.match(html, /Not an official recruitment/);
  assert.match(html, /Codex Pro, OpenAI API, Next\.js, Lucide icons/);
  assert.doesNotMatch(html, /Skills that can travel/);
  assert.match(html, /No account required\./);
  assert.match(html, /Ollie was inspired by the koala featured in/);
  assert.match(html, /certification-statement-2026-census-campaign/);
  assert.doesNotMatch(html, /One profile\. More than one possible path\./);
  assert.doesNotMatch(html, /Official structure in\. Cautious suggestions out\./);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("AI endpoint fails safely when the server key is absent", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("api-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/api/map", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: "The AI service is not connected in this preview.",
    code: "configuration_required",
  });
});
