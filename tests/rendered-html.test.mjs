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
  assert.match(html, /Find your next[\s\S]*public service role\./);
  assert.match(
    html,
    /Match your skills to Australian Government roles and organisations worth exploring\./,
  );
  assert.ok(
    html.indexOf("G’day! I’m your Service Switchboard bot.") <
      html.indexOf("Match your skills to Australian Government roles"),
    "bot greeting should appear before the supporting hero copy",
  );
  assert.ok(
    html.indexOf("G’day! I’m your Service Switchboard bot.") <
      html.indexOf("Find your next"),
    "bot greeting should appear before the hero headline",
  );
  assert.ok(
    html.indexOf('class="preview-guide-copy"') <
      html.indexOf('class="preview-guide-image"'),
    "speech bubble should appear to the left of the koala",
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
  assert.equal(html.match(/Build my job switch/g)?.length, 1);
  assert.match(html, /Calculate my results/);
  assert.match(
    html,
    /<span>Generative AI interprets your words\.<\/span>[\s\S]*?<span>Results are suggestions to investigate, not employment advice\.<\/span>/,
  );
  assert.doesNotMatch(html, /Build my map|Build my career map/);
  assert.doesNotMatch(html, /[↘↗→]/);
  assert.doesNotMatch(html, /Go to Bot Card/);
  assert.match(html, /brand-signal/);
  assert.match(html, /<span>IM2026 ·<\/span> <strong>Service Switchboard<\/strong>/);
  assert.doesNotMatch(html, /href="#top"/);
  assert.doesNotMatch(html, /WORKING PROTOTYPE|working prototype/);
  assert.doesNotMatch(html, /service-switchboard-logo\.png/);
  assert.match(html, /service-switchboard-bot-card\.png/);
  assert.match(html, /class="share-card-graphic"[^>]*src="\/og\.png"/);
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
  assert.match(html, /<strong>Census Engagement Manager<\/strong> for/);
  assert.match(html, /<em>Inclusive Strategies and Engagement<\/em> in Central Victoria/);
  assert.match(html, /Australian Bureau of Statistics \(ABS\)/);
  assert.match(html, /href="https:\/\/www\.abs\.gov\.au\/"/);
  assert.match(html, /US Citizen\. <em>Full Australian working rights\.<\/em>/);
  assert.match(html, /kasey\.robinson@abs\.gov\.au/);
  assert.doesNotMatch(html, /Kasey\.Robinson@abs\.gov\.au/);
  assert.match(html, /koala-suitcase-sticker\.png/);
  assert.match(html, /koala-coffee-chat-sticker\.png/);
  assert.doesNotMatch(html, /koala-colleague-sticker\.png/);
  assert.match(html, /koala-high-vis-ute-sticker\.png/);
  assert.ok(
    html.indexOf("koala-coffee-chat-sticker.png") < html.indexOf('id="background-heading"'),
    "coffee sticker should appear above section 2",
  );
  assert.ok(
    html.indexOf("koala-high-vis-ute-sticker.png") <
      html.indexOf('id="practical-details-heading"'),
    "ute sticker should appear above section 3",
  );
  assert.doesNotMatch(html, /class="form-sticker/);
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
  assert.doesNotMatch(html, /More than one path fits\./);
  assert.doesNotMatch(html, /Official structure in\. Cautious suggestions out\./);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("social shares use the supplied Service Switchboard card", async () => {
  const [layoutSource, shareCard] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/og.png", import.meta.url)),
  ]);

  assert.match(layoutSource, /openGraph:[\s\S]*?url: `\$\{origin\}\/og\.png`/);
  assert.match(layoutSource, /twitter:[\s\S]*?images: \[`\$\{origin\}\/og\.png`\]/);
  assert.match(layoutSource, /IM2026 Service Switchboard share card/);
  assert.equal(shareCard.readUInt32BE(16), 1536);
  assert.equal(shareCard.readUInt32BE(20), 1024);
});

test("llms.txt contains the complete README and contact details", async () => {
  const [readme, llms] = await Promise.all([
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../public/llms.txt", import.meta.url), "utf8"),
  ]);

  assert.equal(llms, readme);
  assert.match(llms, /## Contact/);
  assert.match(llms, /\*\*Kasey Robinson\*\*/);
  assert.match(
    llms,
    /\*\*Census Engagement Manager\*\* for \*Inclusive Strategies and Engagement\* in Central Victoria/,
  );
  assert.match(llms, /\[\*\*Australian Bureau of Statistics \(ABS\)\*\*\]\(https:\/\/www\.abs\.gov\.au\/\)/);
  assert.match(llms, /US Citizen\. \*Full Australian working rights\.\*/);
  assert.match(llms, /\*\*kasey\.robinson@abs\.gov\.au\*\*/);
  assert.match(llms, /kasey\.robinson@abs\.gov\.au/);
  assert.doesNotMatch(llms, /Kasey\.Robinson@abs\.gov\.au/);
  assert.match(llms, /## Contest entry submitted/);
  assert.match(llms, /InnovationMonth@finance\.gov\.au/);
  assert.match(llms, /entry email has been sent/);
  assert.doesNotMatch(llms, /Ready-to-send contest email|Please accept my entry/);
  assert.match(llms, /github\.com\/bitpixi2\/ServiceSwitchboard/);
  assert.match(
    llms,
    /\[Try the Live Bot: switchboard\.bitpixi\.com\]\(https:\/\/switchboard\.bitpixi\.com\)/,
  );
  assert.doesNotMatch(llms, /Go to the Bot Card|#bot-card/);
  assert.match(llms, /Codex Pro generative coding AI/);
  assert.match(llms, /OpenAI API with GPT-5\.6 Sol for the bot calls/);
  assert.doesNotMatch(llms, /Agency and careers links are a curated prototype snapshot/);
  assert.match(llms, /docs\/service-switchboard-generated-pdf-page-1\.png/);
  assert.match(llms, /docs\/service-switchboard-generated-pdf-page-2\.png/);
  assert.ok(
    llms.indexOf("koala-high-vis-ute-sticker.png") <
      llms.indexOf("## A useful next step with a real trade-off"),
  );
  assert.match(llms, /koala-high-vis-ute-sticker\.png[^>]+width="280"/);
  assert.doesNotMatch(llms, /^\| \| \|$/m);
  assert.match(llms, /I learned about the Build a Bureaucrat Bot initiative from an APS webinar\./);
  assert.match(llms, /included Bot Card text\./);
  assert.match(llms, /IM2026 Service Switchboard is an independent working prototype\./);
  assert.match(llms, /It is not official business from the ABS nor the Census\./);
});

test("loading experience explains the wait and names each result section", async () => {
  const [source, styles, wavingSticker] = await Promise.all([
    readFile(new URL("../app/ServiceSwitchboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/koala-switchboard-bot-simple.png", import.meta.url)),
  ]);

  assert.match(source, /Results on the Way/);
  assert.doesNotMatch(source, /Results on the way!/);
  assert.match(source, /We could not flip the switches yet\./);
  assert.doesNotMatch(source, /We could not build the map yet\./);
  assert.match(source, /This process takes ~1 minute/);
  assert.match(source, /please keep this tab open while the\s+bot generates your results/);
  assert.doesNotMatch(source, /Your results are on the way\./);
  assert.doesNotMatch(source, /approximately 1–2 minutes/);
  assert.doesNotMatch(source, /className="loading-mascot"/);
  assert.match(source, /koala-switchboard-bot-simple\.png/);
  assert.equal(source.match(/koala-coffee-chat-sticker\.png/g)?.length, 1);
  assert.equal(wavingSticker[25], 6, "waving koala sticker must use PNG RGBA colour");
  assert.match(source, /role="progressbar"/);
  assert.match(source, /Role families to search/);
  assert.match(source, /Organisations worth investigating/);
  assert.match(source, /Practical next steps/);
  assert.match(source, /Globe2 aria-hidden="true"/);
  assert.match(source, /function LinkedInMark/);
  assert.match(source, /function GitHubMark/);
  assert.match(source, /ArrowDownRight/);
  assert.equal(source.match(/<Chevron \/>/g)?.length, 1);
  assert.match(source, /ExternalLink/);
  assert.doesNotMatch(source, /[↘↗→]/);
  assert.match(source, /interests: \["technology", "design", "data", "cyber", "field"\]/);
  assert.match(styles, /\.hero-actions\s*\{[^}]*border-bottom: 1px solid var\(--line\)/s);
  assert.doesNotMatch(styles, /\.preview-guide\s*\{[^}]*border-top:/s);
  assert.match(styles, /\.privacy-note,[\s\S]*?font-style: italic;/);
  assert.match(styles, /\.character-count\s*\{[^}]*font-style: normal;/s);
  assert.match(styles, /\.coffee-sticker\s*\{[^}]*height: 290px;[^}]*width: auto;/s);
  assert.match(styles, /\.coffee-sticker\s*\{[^}]*height: min\(220px, 64vw\);/s);
  assert.match(styles, /\.ute-sticker\s*\{[^}]*width: 280px;/s);
  assert.match(styles, /\.ute-sticker\s*\{[^}]*width: min\(210px, 62vw\);/s);
  assert.match(
    styles,
    /\.results-illustration img\s*\{[^}]*max-width: 330px;[^}]*width: 48%;/s,
  );
  assert.match(
    styles,
    /\.results-illustration img\s*\{[^}]*max-width: 270px;[^}]*width: 78%;/s,
  );
  assert.match(styles, /\.hero h1 > span\s*\{[^}]*white-space: nowrap;/s);
  assert.match(styles, /@keyframes submit-shimmer/);
  assert.match(
    styles,
    /@media \(min-width: 901px\)[\s\S]*?\.hero-copy\s*\{[^}]*justify-items: center;[^}]*text-align: center;/,
  );
  assert.match(
    styles,
    /@media \(min-width: 901px\)[\s\S]*?\.hero\s*\{[^}]*min-height: auto;[^}]*padding-bottom: 24px;/,
  );
  assert.match(
    styles,
    /@media \(min-width: 901px\)[\s\S]*?\.mapper-section\s*\{[^}]*padding-top: 32px;/,
  );
  assert.match(
    styles,
    /@media \(min-width: 901px\)[\s\S]*?\.hero-lede\s*\{[^}]*max-width: 920px;[^}]*white-space: nowrap;/,
  );
  assert.match(
    styles,
    /@media \(min-width: 901px\)[\s\S]*?\.hero-actions\s*\{[^}]*border-bottom:[^;}]+;[^}]*justify-content: center;/,
  );
  assert.match(
    styles,
    /@media \(min-width: 901px\)[\s\S]*?\.submit-row\s*\{[^}]*border-bottom:[^;}]+;[^}]*flex-direction: column;[^}]*text-align: center;/,
  );
  assert.match(
    styles,
    /@media \(min-width: 901px\)[\s\S]*?\.submit-row > p span\s*\{[^}]*display: block;/,
  );
  assert.match(
    styles,
    /@media \(min-width: 901px\)[\s\S]*?\.summary-card > p\s*\{[^}]*font-size: 22px;[^}]*line-height: 1\.45;/,
  );
  assert.match(
    styles,
    /@media \(min-width: 901px\)[\s\S]*?\.pathway-column\s*\{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/,
  );
  assert.match(
    styles,
    /@media \(min-width: 901px\)[\s\S]*?\.bot-card-section\s*\{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/,
  );
  assert.match(
    styles,
    /@media \(min-width: 901px\)[\s\S]*?\.share-card-graphic\s*\{[^}]*display: block;[^}]*order: 1;/,
  );
  assert.match(
    styles,
    /@media \(min-width: 901px\)[\s\S]*?\.bot-card-graphic\s*\{[^}]*order: 2;/,
  );
  assert.match(
    styles,
    /@media \(min-width: 901px\)[\s\S]*?\.footer-contact nav\s*\{[^}]*flex-wrap: nowrap;/,
  );
});

test("generated results can be saved as a local PDF", async () => {
  const [source, styles, pdfSource] = await Promise.all([
    readFile(new URL("../app/ServiceSwitchboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/resultsPdf.ts", import.meta.url), "utf8"),
  ]);

  assert.match(source, /FileDown/);
  assert.match(source, /Save results as PDF/);
  assert.match(source, /navigator\.canShare/);
  assert.match(source, /navigator\.share/);
  assert.match(source, /const isMobileDevice =/);
  assert.match(source, /if \(isMobileDevice && navigator\.share/);
  assert.match(source, /new File\(\[blob\], filename/);
  assert.match(source, /downloadLink\.download = filename/);
  assert.match(source, /createResultsPdf/);
  assert.match(source, /fetch\("\/koala-switchboard-sticker\.png"\)/);
  assert.match(pdfSource, /doc\.addImage\(data\.koalaImage, "PNG"/);
  assert.doesNotMatch(pdfSource, /Check current official advice/);
  assert.match(pdfSource, /ensureSpace\(24\);\s+y \+= 6;/);
  assert.match(pdfSource, /doc\.line\(margin, y, margin \+ 12, y\);\s+y \+= 11;/);
  assert.match(styles, /@media print/);
  assert.match(styles, /main > :not\(\.results-section\)/);
  assert.match(styles, /\.save-pdf-button/);
  assert.match(styles, /\.footer-contact nav a\s*\{[^}]*align-items: flex-end;/s);
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
