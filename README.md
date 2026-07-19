# IM2026 Service Switchboard

Service Switchboard is a mobile-first generative AI prototype for the Australian
Government Innovation Month bot challenge. It helps current, non-ongoing and
prospective public servants translate transferable skills into role families,
organisations to investigate and practical next steps.

The prototype covers 20 plain-language career areas and a curated catalogue of
Commonwealth organisations. It never claims that a vacancy exists or that a
person is eligible for a role, citizenship waiver or security clearance.

## Run locally

Prerequisites: Node.js `>=22.13.0` and an OpenAI API key.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `OPENAI_API_KEY` in `.env.local`. The key is used only by the server-side
`/api/map` route and is never sent to the browser. `OPENAI_MODEL` defaults to
`gpt-5.6-sol`.

## Validate

```bash
npm run build
npm run lint
npm test
```

## Information sources

- [APS Job Family Framework](https://www.apsc.gov.au/initiatives-and-programs/aps-workforce-strategy-2025/workforce-planning-resources/aps-job-family-framework)
- [Australian Government Organisations Register](https://www.directory.gov.au/reports/australian-government-organisations-register)
- [APSC citizenship guidance](https://www.apsc.gov.au/working-aps/hr-practitioners/recruitment-aps/onboarding/citizenship-aps)
- [AGSVA eligibility and suitability guidance](https://www.agsva.gov.au/applicants/eligibility-suitability)

Agency and careers links are a curated prototype snapshot and must be checked
against current official information before use.

## Bot card

- **Purpose:** Help people discover transferable career paths across Australian public services.
- **Intended users:** Current, non-ongoing and prospective public servants.
- **Information used:** User-entered skills and preferences, an official job-family taxonomy and public agency information.
- **Limitations:** It does not verify vacancies or make recruitment, visa or clearance decisions.
- **Risks:** Generative AI may overgeneralise experience or miss a suitable path; every result needs human checking.
- **Tools:** OpenAI generative AI, curated Australian Government sources and a mobile web interface.

This is an independent IM2026 prototype, not an official recruitment,
migration or security-clearance service.
