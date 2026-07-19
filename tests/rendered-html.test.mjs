import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  assert.match(html, /Find your next public service role\./);
  assert.match(
    html,
    /Match your skills to Australian Government roles and organisations worth exploring\./,
  );
  assert.ok(
    html.indexOf("G’day! I’m your Service Switchboard bot.") <
      html.indexOf("Match your skills to Australian Government roles"),
    "bot greeting should appear before the supporting hero copy",
  );
  assert.doesNotMatch(html, /See where you could serve Australia next\./);
  assert.match(html, /What work interests you\?/);
  assert.match(html, /class="form-step-heading" id="work-interests-heading"/);
  assert.match(html, /class="form-step-heading" id="background-heading"/);
  assert.match(html, /class="form-step-heading" id="practical-details-heading"/);
  assert.doesNotMatch(html, /<legend/);
  assert.doesNotMatch(html, /aria-pressed="true"/);
  assert.match(html, /0(?:<!-- -->)? selected · maximum 8/);
  assert.match(html, /<option selected="">Australia-wide<\/option>/);
  assert.match(html, /<option value="not_sure" selected="">Not sure<\/option>/);
  assert.match(html, /Your background and desired next role\?/);
  assert.match(html, /This site does not store your data/);
  assert.match(html, /sent briefly to an AI\s+service in the cloud to create your results/);
  assert.match(html, /protected, classified or very personal information/);
  assert.ok(
    html.indexOf('class="character-count"') < html.indexOf('class="privacy-note"'),
    "character count should appear before the privacy note",
  );
  assert.doesNotMatch(html, /What have you done—and what do you want more of\?/);
  assert.match(html, /Trades, facilities and logistics/);
  assert.doesNotMatch(html, /Show all 20 career areas|Show fewer areas/);
  assert.doesNotMatch(html, /Your switchboard to your next Australian Government job\./);
  assert.equal(html.match(/Build my job switch/g)?.length, 2);
  assert.doesNotMatch(html, /Build my map|Build my career map/);
  assert.doesNotMatch(html, /[↘↗→]/);
  assert.doesNotMatch(html, /Go to Bot Card/);
  assert.match(html, /brand-signal/);
  assert.match(html, /<span>IM2026 ·<\/span> <strong>Service Switchboard<\/strong>/);
  assert.doesNotMatch(html, /href="#top"/);
  assert.doesNotMatch(html, /WORKING PROTOTYPE|working prototype/);
  assert.doesNotMatch(html, /service-switchboard-logo\.png/);
  assert.match(html, /service-switchboard-bot-card\.png/);
  assert.match(html, /IM2026 Service Switchboard Bot Card\. Purpose:/);
  assert.match(html, /No live vacancies\. No recruitment, visa, citizenship or clearance decisions\./);
  assert.match(html, /switchboard\.bitpixi\.com by Kasey Robinson, ABS\./);
  assert.doesNotMatch(html, /class="bot-card-grid"/);
  assert.match(html, /G’day! I’m your Service Switchboard bot\./);
  assert.doesNotMatch(html, /G’day! I’m Ollie/);
  assert.doesNotMatch(html, /Your guide/);
  assert.match(html, /Acknowledgement of Country/);
  assert.ok(
    html.indexOf('class="footer-contact"') < html.indexOf('class="acknowledgement"'),
    "contact details should appear before the Acknowledgement of Country",
  );
  assert.match(html, /linkedin\.com\/in\/bitpixi/);
  assert.match(html, /github\.com\/bitpixi2\/ServiceSwitchboard/);
  assert.match(
    html,
    /Census Engagement Manager for Inclusive Strategies and Engagement in Central Victoria/,
  );
  assert.match(html, /Australian Bureau of Statistics \(ABS\)/);
  assert.match(html, /href="https:\/\/www\.abs\.gov\.au\/"/);
  assert.match(html, /US Citizen\. Full Australian working rights\./);
  assert.match(html, /kasey\.robinson@abs\.gov\.au/);
  assert.doesNotMatch(html, /Kasey\.Robinson@abs\.gov\.au/);
  assert.match(html, /koala-suitcase-sticker\.png/);
  assert.match(html, /koala-coffee-chat-sticker\.png/);
  assert.doesNotMatch(html, /koala-colleague-sticker\.png/);
  assert.match(html, /koala-high-vis-ute-sticker\.png/);
  assert.doesNotMatch(html, /An independent Innovation Month prototype/);
  assert.doesNotMatch(
    html,
    /Not an official recruitment, migration or security-clearance service\./,
  );
  assert.doesNotMatch(html, /organisations in the prototype catalogue/);
  assert.match(
    html,
    /Codex Pro, OpenAI API, Next\.js, Lucide icons and curated Australian Government sources\./,
  );
  assert.doesNotMatch(html, /Sites hosting/);
  assert.doesNotMatch(html, /Your skills can travel|Skills that can travel/);
  assert.doesNotMatch(html, /No account required\./);
  assert.doesNotMatch(html, /ABS Comms or Media|Census campaign character/);
  assert.doesNotMatch(html, /I chose him because I would like to join a technology team/);
  assert.doesNotMatch(html, /Ollie was inspired by the koala featured in/);
  assert.doesNotMatch(html, /census-media-hub\/census-tools-and-resources\/video/);
  assert.doesNotMatch(html, /certification-statement-2026-census-campaign/);
  assert.doesNotMatch(html, /One profile\. More than one possible path\./);
  assert.doesNotMatch(html, /Official structure in\. Cautious suggestions out\./);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("llms.txt contains the complete README and contact details", async () => {
  const [readme, llms] = await Promise.all([
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../public/llms.txt", import.meta.url), "utf8"),
  ]);

  assert.equal(llms, readme);
  assert.match(llms, /## Contact/);
  assert.match(llms, /kasey\.robinson@abs\.gov\.au/);
  assert.doesNotMatch(llms, /Kasey\.Robinson@abs\.gov\.au/);
  assert.match(llms, /github\.com\/bitpixi2\/ServiceSwitchboard/);
  assert.match(
    llms,
    /\[Try the Live Bot: switchboard\.bitpixi\.com\]\(https:\/\/switchboard\.bitpixi\.com\)/,
  );
  assert.doesNotMatch(llms, /Go to the Bot Card|#bot-card/);
  assert.match(llms, /Codex Pro generative coding AI/);
  assert.match(llms, /OpenAI API with GPT-5\.6 Sol for the bot calls/);
  assert.doesNotMatch(llms, /Agency and careers links are a curated prototype snapshot/);
});

test("loading experience explains the wait and names each result section", async () => {
  const [source, styles] = await Promise.all([
    readFile(new URL("../app/ServiceSwitchboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(source, /This process takes approximately 1–2 minutes/);
  assert.match(source, /please keep this\s+tab open while we build your results/);
  assert.match(source, /koala-switchboard-bot-simple\.png/);
  assert.match(source, /role="progressbar"/);
  assert.match(source, /Role families to search/);
  assert.match(source, /Organisations worth investigating/);
  assert.match(source, /Practical next steps/);
  assert.match(source, /Globe2 aria-hidden="true"/);
  assert.match(source, /function LinkedInMark/);
  assert.match(source, /function GitHubMark/);
  assert.match(source, /ArrowDownRight/);
  assert.match(source, /ExternalLink/);
  assert.doesNotMatch(source, /[↘↗→]/);
  assert.match(source, /interests: \["technology", "design", "data", "cyber", "field"\]/);
  assert.match(styles, /\.hero-actions\s*\{[^}]*border-bottom: 1px solid var\(--line\)/s);
  assert.doesNotMatch(styles, /\.preview-guide\s*\{[^}]*border-top:/s);
  assert.match(styles, /\.privacy-note,[\s\S]*?font-style: italic;/);
  assert.match(styles, /\.character-count\s*\{[^}]*font-style: normal;/s);
});

test("generated results can be saved as a local PDF", async () => {
  const [source, styles] = await Promise.all([
    readFile(new URL("../app/ServiceSwitchboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(source, /FileDown/);
  assert.match(source, /Save results as PDF/);
  assert.match(source, /window\.print\(\)/);
  assert.match(styles, /@media print/);
  assert.match(styles, /main > :not\(\.results-section\)/);
  assert.match(styles, /\.save-pdf-button/);
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
