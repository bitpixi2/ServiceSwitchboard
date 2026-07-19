"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowDownRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  ClipboardCheck,
  Cpu,
  Database,
  ExternalLink,
  FlaskConical,
  FolderSearch,
  Gavel,
  Globe2,
  Headset,
  HeartPulse,
  Landmark,
  MapPinned,
  MessageSquareText,
  Palette,
  Scale,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  UsersRound,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  agencies,
  agencyById,
  careerCategories,
  categoryById,
} from "./catalog";

type Pathway = "explore_now" | "confirm_first" | "future_path";

type CareerMap = {
  summary: string;
  skillSignals: string[];
  roleMatches: Array<{
    categoryId: string;
    fit: string;
    searchTerms: string[];
  }>;
  agencyMatches: Array<{
    agencyId: string;
    reason: string;
    pathway: Pathway;
    questions: string[];
  }>;
  nextSteps: string[];
  recruiterMessage: string;
  limitations: string[];
};

type FormState = {
  interests: string[];
  story: string;
  location: string;
  workSetting: "any" | "office" | "hybrid" | "remote" | "field";
  employmentStatus:
    | "ongoing_aps"
    | "non_ongoing_aps"
    | "contractor"
    | "outside_government"
    | "not_sure";
  citizenshipStatus:
    | "citizen"
    | "permanent_resident"
    | "other_work_rights"
    | "prefer_not_to_say";
};

const initialForm: FormState = {
  interests: [],
  story: "",
  location: "Australia-wide",
  workSetting: "any",
  employmentStatus: "not_sure",
  citizenshipStatus: "prefer_not_to_say",
};

const pathwayMeta: Record<
  Pathway,
  { label: string; eyebrow: string; description: string }
> = {
  explore_now: {
    label: "Explore now",
    eyebrow: "A place to look",
    description: "Relevant work may exist here. Check the current job notice.",
  },
  confirm_first: {
    label: "Confirm first",
    eyebrow: "Ask before applying",
    description: "A recruitment condition needs a human answer.",
  },
  future_path: {
    label: "Build toward",
    eyebrow: "A possible later move",
    description: "A useful direction with another step in front of it.",
  },
};

const categoryIcons: Record<string, LucideIcon> = {
  administration: BriefcaseBusiness,
  finance: BadgeDollarSign,
  economics: TrendingUp,
  data: Database,
  technology: Cpu,
  cyber: ShieldCheck,
  design: Palette,
  policy: Landmark,
  projects: ClipboardCheck,
  regulation: Scale,
  service: Headset,
  communications: MessageSquareText,
  field: MapPinned,
  science: FlaskConical,
  health: HeartPulse,
  legal: Gavel,
  people: UsersRound,
  information: FolderSearch,
  procurement: ShoppingCart,
  trades: Wrench,
};

const loadingStages = [
  {
    title: "Reading your profile",
    detail: "Understanding your background, interests and work preferences.",
  },
  {
    title: "Transferable skills",
    detail: "Finding strengths that could travel across the public service.",
  },
  {
    title: "Career pathway map",
    detail: "Connecting your experience to more than one possible direction.",
  },
  {
    title: "Role families to search",
    detail: "Preparing useful job titles and search terms.",
  },
  {
    title: "Organisations worth investigating",
    detail: "Matching your interests to Australian Government organisations.",
  },
  {
    title: "Practical next steps",
    detail: "Writing a small next move and a question for recruitment.",
  },
] as const;

const botCardAlt =
  "IM2026 Service Switchboard Bot Card. Purpose: Show where transferable skills may fit across Australian public services. Intended users: Current, non-ongoing and prospective public servants. Information used: User-entered skills and preferences, official job-family and public agency information. Limitations: No live vacancies. No recruitment, visa, citizenship or clearance decisions. Risks: AI may miss a path or use outdated information. Check official advice. Tools used: Codex Pro, OpenAI API, Next.js, Lucide icons and curated Australian Government sources. switchboard.bitpixi.com by Kasey Robinson, ABS.";

function Chevron() {
  return <ArrowDownRight aria-hidden="true" strokeWidth={2.2} />;
}

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 .5C5.73.5.65 5.58.65 11.85c0 5.02 3.25 9.28 7.76 10.78.57.1.78-.25.78-.55v-2.14c-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.24 3.31.95.1-.73.4-1.24.72-1.52-2.52-.29-5.17-1.26-5.17-5.61 0-1.24.44-2.25 1.17-3.05-.12-.29-.51-1.44.11-3 0 0 .95-.31 3.12 1.16a10.8 10.8 0 0 1 5.68 0c2.17-1.47 3.12-1.16 3.12-1.16.62 1.56.23 2.71.11 3 .73.8 1.17 1.81 1.17 3.05 0 4.36-2.65 5.32-5.18 5.6.41.35.77 1.05.77 2.12v3.14c0 .3.2.66.78.55a11.36 11.36 0 0 0 7.76-10.78C23.35 5.58 18.27.5 12 .5Z"
      />
    </svg>
  );
}

function LinkedInMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM2.8 9.8h4.36V23H2.8V9.8Zm6.95 0h4.18v1.8h.06c.58-1.1 2-2.26 4.11-2.26 4.4 0 5.21 2.9 5.21 6.67V23h-4.35v-6.2c0-1.48-.03-3.38-2.06-3.38-2.06 0-2.38 1.61-2.38 3.27V23H9.75V9.8Z"
      />
    </svg>
  );
}

export default function ServiceSwitchboard() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [map, setMap] = useState<CareerMap | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(8);
  const [loadingStage, setLoadingStage] = useState(0);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!loading) return;

    const previousOverflow = document.body.style.overflow;
    const startedAt = Date.now();
    document.body.style.overflow = "hidden";

    const updateLoadingState = () => {
      const elapsedSeconds = (Date.now() - startedAt) / 1000;
      setLoadingProgress(Math.min(92, Math.round(8 + elapsedSeconds * 1.15)));
      setLoadingStage(
        Math.min(loadingStages.length - 1, Math.floor(elapsedSeconds / 7)),
      );
    };

    updateLoadingState();
    const interval = window.setInterval(updateLoadingState, 1000);

    return () => {
      window.clearInterval(interval);
      document.body.style.overflow = previousOverflow;
    };
  }, [loading]);

  const groupedMatches = useMemo(() => {
    const groups: Record<Pathway, CareerMap["agencyMatches"]> = {
      explore_now: [],
      confirm_first: [],
      future_path: [],
    };
    map?.agencyMatches.forEach((match) => groups[match.pathway].push(match));
    return groups;
  }, [map]);

  function toggleInterest(id: string) {
    setForm((current) => {
      if (current.interests.includes(id)) {
        return {
          ...current,
          interests: current.interests.filter((interest) => interest !== id),
        };
      }
      if (current.interests.length >= 8) return current;
      return { ...current, interests: [...current.interests, id] };
    });
  }

  function loadExample() {
    setForm({
      interests: ["technology", "design", "data", "cyber", "field"],
      story:
        "I work on a fixed-term government project. I enjoy building small web tools, explaining complicated information visually, working with communities and experimenting responsibly with AI. I would like to understand what other kinds of public-service work could use those skills.",
      location: "Victoria",
      workSetting: "hybrid",
      employmentStatus: "non_ongoing_aps",
      citizenshipStatus: "permanent_resident",
    });
    setError(null);
    window.setTimeout(() => {
      document.getElementById("your-story")?.focus();
    }, 0);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCopied(false);

    if (form.interests.length === 0) {
      setError("Choose at least one kind of work to explore.");
      return;
    }
    if (form.story.trim().length < 20) {
      setError("Tell us a little more about what you have done or enjoy doing.");
      document.getElementById("your-story")?.focus();
      return;
    }

    setLoadingProgress(8);
    setLoadingStage(0);
    setLoading(true);
    try {
      const response = await fetch("/api/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as {
        map?: CareerMap;
        generatedAt?: string;
        error?: string;
        code?: string;
      };

      if (!response.ok || !payload.map) {
        throw new Error(
          payload.code === "configuration_required"
            ? "The AI service has not been connected to this preview yet."
            : payload.error ?? "Your map could not be created. Please try again.",
        );
      }

      setMap(payload.map);
      setGeneratedAt(payload.generatedAt ?? new Date().toISOString());
      window.setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Your map could not be created. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyMessage() {
    if (!map) return;
    await navigator.clipboard.writeText(map.recruiterMessage);
    setCopied(true);
  }

  return (
    <main>
      {loading && (
        <div className="loading-overlay" role="presentation">
          <section
            className="loading-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="loading-title"
            aria-describedby="loading-description"
          >
            <div className="loading-mascot" aria-hidden="true">
              <img src="/koala-switchboard-bot-simple.png" alt="" />
            </div>
            <div className="loading-content">
              <p className="kicker">Building your job switch</p>
              <h2 id="loading-title">Your results are on the way.</h2>
              <p id="loading-description" className="loading-warning">
                This process takes approximately 1–2 minutes, so please keep this
                tab open while we build your results.
              </p>

              <div className="loading-now" aria-live="polite" aria-atomic="true">
                <small>Now preparing</small>
                <strong>{loadingStages[loadingStage].title}</strong>
                <span>{loadingStages[loadingStage].detail}</span>
              </div>

              <div
                className="loading-progress"
                role="progressbar"
                aria-label="Job switch progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={loadingProgress}
              >
                <span style={{ width: `${loadingProgress}%` }} />
              </div>

              <ol className="loading-stages" aria-label="Result sections being prepared">
                {loadingStages.map((stage, index) => (
                  <li
                    className={
                      index < loadingStage
                        ? "complete"
                        : index === loadingStage
                          ? "active"
                          : undefined
                    }
                    key={stage.title}
                  >
                    <span aria-hidden="true">{index < loadingStage ? "✓" : index + 1}</span>
                    {stage.title}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>
      )}

      <header className="site-header">
        <a className="brand" href="#top" aria-label="IM2026 Service Switchboard home">
          <span className="brand-signal" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>Service Switchboard</strong>
            <small>IM2026 · working prototype</small>
          </span>
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <h1>Find your next public service role.</h1>

          <div
            className="switchboard-preview"
            aria-label="Meet Ollie, the Service Switchboard bot"
          >
            <div className="preview-guide">
              <span className="preview-guide-image">
                <img
                  src="/koala-switchboard-sticker.png"
                  alt="Ollie the Koala operating a colourful switchboard"
                />
              </span>
              <span className="preview-guide-copy">
                <strong>G’day! I’m your Service Switchboard bot.</strong>
              </span>
            </div>
          </div>

          <p className="hero-lede">
            Match your skills to Australian Government roles and organisations
            worth exploring.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#mapper">
              Build my job switch <Chevron />
            </a>
            <button className="button text-button" type="button" onClick={loadExample}>
              Use a sample profile
            </button>
          </div>
        </div>
      </section>

      <section className="mapper-section" id="mapper">
        <div className="mapper-intro">
          <img
            className="section-sticker suitcase-sticker"
            src="/koala-suitcase-sticker.png"
            alt="Ollie the Koala setting out with a suitcase"
          />
        </div>

        <form onSubmit={submit} className="mapper-form">
          <section
            className="form-block categories-block"
            aria-labelledby="work-interests-heading"
          >
            <h2 className="form-step-heading" id="work-interests-heading">
              <span>1</span> What work interests you?
            </h2>
            <div className="category-grid" role="group" aria-labelledby="work-interests-heading">
              {careerCategories.map((category) => {
                const selected = form.interests.includes(category.id);
                const CategoryIcon = categoryIcons[category.id] ?? BriefcaseBusiness;
                return (
                  <button
                    className={`category-card${selected ? " selected" : ""}`}
                    type="button"
                    key={category.id}
                    aria-pressed={selected}
                    onClick={() => toggleInterest(category.id)}
                  >
                    <span className="category-mark" aria-hidden="true">
                      <CategoryIcon strokeWidth={2.2} />
                    </span>
                    <span>
                      <strong>{category.label}</strong>
                      <small>{category.description}</small>
                    </span>
                    <i aria-hidden="true">{selected ? "✓" : "+"}</i>
                  </button>
                );
              })}
            </div>
            <p className="selection-count" aria-live="polite">
              {form.interests.length} selected · maximum 8
            </p>
          </section>

          <section
            className="form-block story-block"
            aria-labelledby="background-heading"
          >
            <h2 className="form-step-heading" id="background-heading">
              <span>2</span> Your background and desired next role?
            </h2>
            <div className="form-illustration-layout story-layout">
              <div>
                <label htmlFor="your-story">
                  A few sentences is enough
                  <textarea
                    id="your-story"
                    value={form.story}
                    maxLength={1600}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, story: event.target.value }))
                    }
                    placeholder="For example: I coordinate a national field project, build small web tools, explain complex information and enjoy working with communities…"
                  />
                </label>
                <div className="story-foot">
                  <span>Do not enter protected, classified or personal information.</span>
                  <span>{form.story.length}/1600</span>
                </div>
              </div>
              <img
                className="form-sticker colleague-sticker"
                src="/koala-coffee-chat-sticker.png"
                alt="Two koala colleagues discussing career options over coffee"
              />
            </div>
          </section>

          <section
            className="form-block details-block"
            aria-labelledby="practical-details-heading"
          >
            <h2 className="form-step-heading" id="practical-details-heading">
              <span>3</span> Add practical details
            </h2>
            <div className="form-illustration-layout details-layout">
              <div>
                <div className="details-grid">
                  <label>
                    Location
                    <select
                      value={form.location}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, location: event.target.value }))
                      }
                    >
                      <option>Australia-wide</option>
                      <option>Australian Capital Territory</option>
                      <option>New South Wales</option>
                      <option>Northern Territory</option>
                      <option>Queensland</option>
                      <option>South Australia</option>
                      <option>Tasmania</option>
                      <option>Victoria</option>
                      <option>Western Australia</option>
                    </select>
                  </label>
                  <label>
                    Preferred setting
                    <select
                      value={form.workSetting}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          workSetting: event.target.value as FormState["workSetting"],
                        }))
                      }
                    >
                      <option value="any">Open to any setting</option>
                      <option value="office">Mostly on site</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Remote where available</option>
                      <option value="field">Field or operational</option>
                    </select>
                  </label>
                  <label>
                    Current work arrangement
                    <select
                      value={form.employmentStatus}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          employmentStatus: event.target
                            .value as FormState["employmentStatus"],
                        }))
                      }
                    >
                      <option value="ongoing_aps">Ongoing APS employee</option>
                      <option value="non_ongoing_aps">Non-ongoing APS employee</option>
                      <option value="contractor">Contractor or labour hire</option>
                      <option value="outside_government">Not currently in government</option>
                      <option value="not_sure">Not sure</option>
                    </select>
                  </label>
                  <label>
                    Citizenship status
                    <select
                      value={form.citizenshipStatus}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          citizenshipStatus: event.target
                            .value as FormState["citizenshipStatus"],
                        }))
                      }
                    >
                      <option value="citizen">Australian citizen</option>
                      <option value="permanent_resident">Australian permanent resident</option>
                      <option value="other_work_rights">Other Australian work rights</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </label>
                </div>
                <p className="detail-note">
                  This helps the bot identify questions to ask. It does not determine eligibility.
                </p>
              </div>
              <img
                className="form-sticker high-vis-sticker"
                src="/koala-high-vis-ute-sticker.png"
                alt="Ollie the Koala with his paws in his high-vis vest pockets beside a utility ute"
              />
            </div>
          </section>

          {error && (
            <div className="form-error" role="alert">
              <strong>We could not build the map yet.</strong>
              <span>{error}</span>
            </div>
          )}

          <div className="submit-row">
            <button className="button primary submit-button" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Mapping possible paths…
                </>
              ) : (
                <>
                  Build my job switch <Chevron />
                </>
              )}
            </button>
            <p>
              Generative AI interprets your words. Results are suggestions to investigate,
              not employment advice.
            </p>
          </div>
        </form>
      </section>

      {map && (
        <section className="results-section" ref={resultsRef} aria-labelledby="results-title">
          <div className="results-heading">
            <div>
              <p className="kicker">Your service switchboard</p>
              <h2 id="results-title">More than one path fits.</h2>
            </div>
            <span className="generated-time">
              AI-generated · {generatedAt ? new Date(generatedAt).toLocaleDateString("en-AU") : "today"}
            </span>
          </div>

          <div className="summary-card">
            <p>{map.summary}</p>
            <div className="skill-list" aria-label="Transferable skills found">
              {map.skillSignals.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>

          <div className="map-board" aria-label="Visual career pathway map">
            <div className="map-source-node">
              <small>Your experience</small>
              <strong>{map.skillSignals.slice(0, 2).join(" + ")}</strong>
            </div>
            <div className="map-connector" aria-hidden="true" />
            <div className="role-nodes">
              {map.roleMatches.map((role, index) => {
                const category = categoryById[role.categoryId];
                const RoleIcon = categoryIcons[role.categoryId] ?? BriefcaseBusiness;
                return (
                  <article key={`${role.categoryId}-${index}`} style={{ "--delay": `${index * 90}ms` } as CSSProperties}>
                    <span aria-hidden="true">
                      <RoleIcon strokeWidth={2.2} />
                    </span>
                    <strong>{category?.shortLabel ?? role.categoryId}</strong>
                  </article>
                );
              })}
            </div>
            <div className="map-connector branching" aria-hidden="true" />
            <div className="agency-nodes">
              {map.agencyMatches.slice(0, 4).map((match, index) => {
                const agency = agencyById[match.agencyId];
                return (
                  <article key={`${match.agencyId}-${index}`} style={{ "--delay": `${360 + index * 90}ms` } as CSSProperties}>
                    <small>{agency?.portfolio}</small>
                    <strong>{agency?.shortName ?? match.agencyId}</strong>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="role-match-section">
            <div className="subheading">
              <span>01</span>
              <div>
                <h3>Role families to search</h3>
                <p>Use several job titles. Government language varies between agencies.</p>
              </div>
            </div>
            <div className="role-match-grid">
              {map.roleMatches.map((role) => {
                const category = categoryById[role.categoryId];
                const RoleIcon = categoryIcons[role.categoryId] ?? BriefcaseBusiness;
                return (
                  <article className="role-match-card" key={role.categoryId}>
                    <div className="role-card-top">
                      <span aria-hidden="true">
                        <RoleIcon strokeWidth={2.2} />
                      </span>
                      <h4>{category?.label ?? role.categoryId}</h4>
                    </div>
                    <p>{role.fit}</p>
                    <div className="search-terms">
                      {role.searchTerms.map((term) => (
                        <span key={term}>{term}</span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="agency-match-section">
            <div className="subheading">
              <span>02</span>
              <div>
                <h3>Organisations worth investigating</h3>
                <p>These are organisational matches, not a list of current vacancies.</p>
              </div>
            </div>

            <div className="pathway-columns">
              {(Object.keys(pathwayMeta) as Pathway[]).map((pathway) => {
                const matches = groupedMatches[pathway];
                if (matches.length === 0) return null;
                const meta = pathwayMeta[pathway];
                return (
                  <section className={`pathway-column ${pathway}`} key={pathway}>
                    <header>
                      <small>{meta.eyebrow}</small>
                      <h4>{meta.label}</h4>
                      <p>{meta.description}</p>
                    </header>
                    {matches.map((match) => {
                      const agency = agencyById[match.agencyId];
                      if (!agency) return null;
                      return (
                        <article className="agency-card" key={match.agencyId}>
                          <small>{agency.portfolio} portfolio</small>
                          <h5>{agency.name}</h5>
                          <p>{match.reason}</p>
                          {match.questions.length > 0 && (
                            <details>
                              <summary>Questions to check</summary>
                              <ul>
                                {match.questions.map((question) => (
                                  <li key={question}>{question}</li>
                                ))}
                              </ul>
                            </details>
                          )}
                          <a href={agency.url} target="_blank" rel="noreferrer">
                            Visit official careers page <ExternalLink aria-hidden="true" />
                          </a>
                        </article>
                      );
                    })}
                  </section>
                );
              })}
            </div>
          </div>

          <div className="action-section">
            <div className="next-steps-card">
              <p className="kicker">03 · A small next move</p>
              <h3>Your practical next steps</h3>
              <ol>
                {map.nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <a
                className="button secondary"
                href="https://www.apsjobs.gov.au/s/"
                target="_blank"
                rel="noreferrer"
              >
                Search APSJobs <ExternalLink aria-hidden="true" />
              </a>
            </div>
            <div className="message-card">
              <p className="kicker">A question for recruitment</p>
              <h3>Ask before investing in an application</h3>
              <blockquote>{map.recruiterMessage}</blockquote>
              <button className="copy-button" type="button" onClick={copyMessage}>
                {copied ? "Copied" : "Copy message"}
              </button>
            </div>
          </div>

          <div className="results-illustration">
            <img
              src="/koala-coffee-chat-sticker.png"
              alt="Two koala colleagues discussing career options over coffee"
            />
          </div>

          <details className="limitations">
            <summary>What this map cannot tell you</summary>
            <ul>
              {map.limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </details>
        </section>
      )}

      <section
        className="bot-card-section"
        id="bot-card"
        aria-label="Service Switchboard bot card"
      >
        <img
          className="bot-card-graphic"
          src="/service-switchboard-bot-card.png"
          alt={botCardAlt}
        />
      </section>

      <footer>
        <div className="footer-contact">
          <strong>Kasey Robinson</strong>
          <nav aria-label="Kasey Robinson contact links">
            <a href="https://bitpixi.com" target="_blank" rel="noreferrer">
              <Globe2 aria-hidden="true" />
              <span>Website</span>
            </a>
            <a href="https://linkedin.com/in/bitpixi" target="_blank" rel="noreferrer">
              <LinkedInMark />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/bitpixi2/ServiceSwitchboard"
              target="_blank"
              rel="noreferrer"
            >
              <GitHubMark />
              <span>GitHub</span>
            </a>
          </nav>
          <div className="footer-contact-details">
            <span>
              Census Engagement Manager for Inclusive Strategies and Engagement in
              Central Victoria
            </span>
            <a href="https://www.abs.gov.au/" target="_blank" rel="noreferrer">
              Australian Bureau of Statistics (ABS)
            </a>
            <span>US Citizen. Full Australian working rights.</span>
            <a href="mailto:Kasey.Robinson@abs.gov.au">Kasey.Robinson@abs.gov.au</a>
          </div>
        </div>

        <div className="acknowledgement">
          <strong>Acknowledgement of Country</strong>
          <p>
            We acknowledge the Traditional Owners and Custodians of Country
            throughout Australia and recognise their continuing connection to
            land, waters and communities. We pay our respects to Aboriginal and
            Torres Strait Islander peoples, and to Elders past and present.
          </p>
        </div>
      </footer>
    </main>
  );
}
