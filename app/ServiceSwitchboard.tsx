"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  ClipboardCheck,
  Cpu,
  Database,
  FlaskConical,
  FolderSearch,
  Gavel,
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
  interests: ["technology", "design", "data"],
  story: "",
  location: "Victoria",
  workSetting: "any",
  employmentStatus: "non_ongoing_aps",
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

function Chevron() {
  return <span aria-hidden="true">↘</span>;
}

export default function ServiceSwitchboard() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [map, setMap] = useState<CareerMap | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

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
        <a className="quiet-link" href="#bot-card">
          Go to Bot Card
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">Your skills can travel</p>
          <h1>See where you could serve Australia next.</h1>
          <p className="hero-lede">
            Describe what you are good at and what matters to you. Get a clear,
            cautious map of role families and Commonwealth organisations worth
            exploring.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#mapper">
              Build my map <Chevron />
            </a>
            <button className="button text-button" type="button" onClick={loadExample}>
              Use a sample profile
            </button>
          </div>
        </div>

        <div className="switchboard-preview" aria-label="Example career map">
          <div className="preview-guide">
            <span className="preview-guide-image">
              <img
                src="/koala-switchboard-sticker.png"
                alt="Ollie the Koala operating a colourful switchboard"
              />
            </span>
            <span className="preview-guide-copy">
              <small>Your guide</small>
              <strong>G’day! I’m Ollie, your Service Switchboard bot.</strong>
            </span>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Service principles">
        <span>No account required.</span>
      </section>

      <section className="mapper-section" id="mapper">
        <div className="mapper-intro">
          <div className="section-heading">
            <h2>Your switchboard to your next Australian Government job.</h2>
          </div>
          <img
            className="section-sticker suitcase-sticker"
            src="/koala-suitcase-sticker.png"
            alt="Ollie the Koala setting out with a suitcase"
          />
        </div>

        <form onSubmit={submit} className="mapper-form">
          <fieldset className="form-block categories-block">
            <legend>
              <span>1</span> What work interests you?
            </legend>
            <div className="category-grid">
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
          </fieldset>

          <fieldset className="form-block story-block">
            <legend>
              <span>2</span> Your background and desired next role?
            </legend>
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
          </fieldset>

          <fieldset className="form-block details-block">
            <legend>
              <span>3</span> Add practical details
            </legend>
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
          </fieldset>

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
                  Build my career map <Chevron />
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
                return (
                  <article key={`${role.categoryId}-${index}`} style={{ "--delay": `${index * 90}ms` } as CSSProperties}>
                    <span>{category?.mark ?? "→"}</span>
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
                return (
                  <article className="role-match-card" key={role.categoryId}>
                    <div className="role-card-top">
                      <span>{category?.mark ?? "→"}</span>
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
                            Visit official careers page <span aria-hidden="true">↗</span>
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
                Search APSJobs <span aria-hidden="true">↗</span>
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

      <section className="bot-card-section" id="bot-card">
        <div className="bot-card-intro">
          <span className="bot-card-mascot">
            <img
              src="/koala-switchboard-sticker.png"
              alt="Ollie the Koala operating the Service Switchboard"
            />
          </span>
          <div className="bot-card-title">
            <span>IM2026</span>
            <div>
              <p>Bot card</p>
              <h2>Service Switchboard</h2>
            </div>
          </div>
        </div>
        <dl className="bot-card-grid">
          <div>
            <dt>Purpose</dt>
            <dd>Help people discover transferable career paths across Australian public services.</dd>
          </div>
          <div>
            <dt>Intended users</dt>
            <dd>Current, non-ongoing and prospective public servants exploring their next move.</dd>
          </div>
          <div>
            <dt>Information used</dt>
            <dd>User-entered skills and preferences, an official job-family taxonomy and public agency information.</dd>
          </div>
          <div>
            <dt>Limitations</dt>
            <dd>It does not list every employer, verify vacancies or make recruitment, visa or clearance decisions.</dd>
          </div>
          <div>
            <dt>Risks</dt>
            <dd>AI may overgeneralise experience or miss a suitable path. Every result needs human checking.</dd>
          </div>
          <div>
            <dt>Tools used</dt>
            <dd>Codex Pro, OpenAI API, Next.js, Lucide icons, curated Australian Government sources and Sites hosting.</dd>
          </div>
        </dl>
      </section>

      <footer>
        <div className="footer-project">
          <strong>IM2026 Service Switchboard</strong>
          <p>
            An independent Innovation Month prototype. Not an official recruitment,
            migration or security-clearance service.
          </p>
          <span>{agencies.length} organisations in the prototype catalogue</span>
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

        <div className="footer-contact">
          <strong>Kasey Robinson</strong>
          <nav aria-label="Kasey Robinson contact links">
            <a href="https://bitpixi.com" target="_blank" rel="noreferrer">
              Website
            </a>
            <a href="https://linkedin.com/in/bitpixi" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href="https://github.com/bitpixi2" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
          <div className="footer-contact-details">
            <span>Inclusive Strategies Census Engagement Manager</span>
            <span>Bendigo, Australia</span>
            <span>US Citizen. Full Australian working rights.</span>
            <a href="mailto:Kasey.Robinson@abs.gov.au">Kasey.Robinson@abs.gov.au</a>
          </div>
          <p className="footer-inspiration">
            Ollie was inspired by the koala featured in{" "}
            <a
              href="https://www.abs.gov.au/about/our-organisation/our-commitments/certification-statement-2026-census-campaign"
              target="_blank"
              rel="noreferrer"
            >
              ABS Census advertising
            </a>
            . I chose him because I would like to join a technology team.
          </p>
        </div>
      </footer>
    </main>
  );
}
