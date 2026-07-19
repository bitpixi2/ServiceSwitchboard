import { z } from "zod";
import { agencies, careerCategories } from "../../catalog";

export const runtime = "nodejs";

const pathwayValues = ["explore_now", "confirm_first", "future_path"] as const;
const categoryIds = careerCategories.map((category) => category.id) as [
  string,
  ...string[],
];
const agencyIds = agencies.map((agency) => agency.id) as [string, ...string[]];

const RequestSchema = z.object({
  interests: z.array(z.enum(categoryIds)).min(1).max(8),
  story: z.string().trim().min(20).max(1600),
  location: z.string().trim().min(1).max(80),
  workSetting: z.enum(["any", "office", "hybrid", "remote", "field"]),
  employmentStatus: z.enum([
    "ongoing_aps",
    "non_ongoing_aps",
    "contractor",
    "outside_government",
    "not_sure",
  ]),
  citizenshipStatus: z.enum([
    "citizen",
    "permanent_resident",
    "other_work_rights",
    "prefer_not_to_say",
  ]),
});

const CareerMapSchema = z.object({
  summary: z.string(),
  skillSignals: z.array(z.string()).min(3).max(6),
  roleMatches: z
    .array(
      z.object({
        categoryId: z.enum(categoryIds),
        fit: z.string(),
        searchTerms: z.array(z.string()).min(2).max(5),
      }),
    )
    .min(2)
    .max(4),
  agencyMatches: z
    .array(
      z.object({
        agencyId: z.enum(agencyIds),
        reason: z.string(),
        pathway: z.enum(pathwayValues),
        questions: z.array(z.string()).max(3),
      }),
    )
    .min(3)
    .max(6),
  nextSteps: z.array(z.string()).min(3).max(5),
  recruiterMessage: z.string(),
  limitations: z.array(z.string()).min(2).max(4),
});

function buildCatalog() {
  return agencies.map((agency) => ({
    id: agency.id,
    name: agency.name,
    portfolio: agency.portfolio,
    focus: agency.focus,
    categories: agency.categories,
    securitySensitive: Boolean(agency.securitySensitive),
  }));
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error: "The AI service is not connected in this preview.",
        code: "configuration_required",
      },
      { status: 503 },
    );
  }

  let input: z.infer<typeof RequestSchema>;
  try {
    input = RequestSchema.parse(await request.json());
  } catch {
    return Response.json(
      { error: "Please check the details you entered and try again." },
      { status: 400 },
    );
  }

  const selectedLabels = input.interests.map(
    (id) => careerCategories.find((category) => category.id === id)?.label ?? id,
  );

  try {
    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5.6-sol",
        reasoning: { effort: "low" },
        store: false,
        max_output_tokens: 2200,
        instructions: `
Role: You are IM2026 Service Switchboard, a careful Australian public-service career exploration assistant.

Goal: Translate the user's transferable skills and interests into realistic Commonwealth role families and organisations worth investigating.

Success criteria:
- Use only category IDs and agency IDs from the supplied catalogue.
- Recommend 2 to 4 role families and 3 to 6 agencies with specific, concise reasons.
- Surface transferable skills evident in the user's own words without inventing qualifications.
- Give useful APSJobs search terms and small next steps.
- Write in clear Australian English, suitable for a mobile screen.

Safety and evidence constraints:
- This is career exploration, not recruitment, migration, legal or security-clearance advice.
- Never state or imply that the user is eligible, will be hired, holds a clearance, or that a vacancy currently exists.
- Treat every agency website and vacancy notice as the authority for current requirements.
- Australian permanent residency is not Australian citizenship.
- If the user is not an Australian citizen or prefers not to say, use confirm_first for every APS-style agency recommendation because citizenship waivers are agency-specific.
- Use confirm_first for every securitySensitive agency unless the user is an Australian citizen; citizenship still does not guarantee a clearance.
- A non-ongoing APS employee should not be told they can use a section 26 transfer. Suggest checking the advertised engagement path.
- Do not request or repeat visa numbers, clearance details, protected information, personal identifiers or sensitive workplace information.
- If the input is vague, make conservative matches and say what to clarify rather than filling gaps.

Pathway meanings:
- explore_now: a relevant organisation or role family to investigate now; still confirm the job notice.
- confirm_first: ask the nominated recruitment contact about citizenship, clearance, employment status or another material condition before investing in an application.
- future_path: a plausible longer-term direction that needs a stated capability, qualification, citizenship or other step first.

Agency catalogue:
${JSON.stringify(buildCatalog())}
        `.trim(),
        input: JSON.stringify({
          selectedInterests: selectedLabels,
          selectedInterestIds: input.interests,
          userStory: input.story,
          location: input.location,
          preferredWorkSetting: input.workSetting,
          currentEmploymentStatus: input.employmentStatus,
          citizenshipStatus: input.citizenshipStatus,
        }),
        text: {
          format: {
            type: "json_schema",
            name: "service_switchboard_map",
            strict: true,
            schema: z.toJSONSchema(CareerMapSchema),
          },
        },
      }),
    });

    const payload = (await openAIResponse.json()) as {
      output?: Array<{
        type: string;
        content?: Array<{ type: string; text?: string; refusal?: string }>;
      }>;
      error?: { message?: string };
    };

    if (!openAIResponse.ok) {
      console.error("OpenAI response error", openAIResponse.status, payload.error?.message);
      throw new Error("OpenAI request failed");
    }

    const content = payload.output
      ?.find((item) => item.type === "message")
      ?.content?.find((item) => item.type === "output_text" || item.type === "refusal");

    if (content?.type === "refusal") {
      return Response.json(
        { error: "This profile could not be mapped. Try describing your work in different words." },
        { status: 422 },
      );
    }

    if (!content?.text) {
      return Response.json(
        { error: "The map could not be completed. Please try again." },
        { status: 502 },
      );
    }

    const parsedMap = CareerMapSchema.parse(JSON.parse(content.text));

    return Response.json({
      map: parsedMap,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Service Switchboard generation failed", error);
    return Response.json(
      { error: "The map could not be completed right now. Please try again." },
      { status: 502 },
    );
  }
}
