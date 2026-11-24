# Atomic Billboard

> **Product concept / pre-development**
>
> **Discover what organisations implemented, how they implemented it, and what actually happened.**

A business-to-business (B2B) case-study publishing and research platform that turns real-world technology implementations into **structured, searchable, comparable evidence**. Companies can apply to publish case studies; professionals can register using verified work email addresses to explore the studies, inspect their constituent **atomic implementation steps**, and learn from outcomes across organisations.

The initial focus is **enterprise AI and automation**. The long-term goal is a reusable body of *execution intelligence*: not simply which technologies are promising, but which tasks, dependencies, trade-offs, constraints, and decisions show up in real implementations.

**Status:** This README defines the original product concept. See [implementation notes](IMPLEMENTATION.md) for the current application.

---

## Contents

1. [Vision and positioning](#1-vision-and-positioning)
2. [The problem](#2-the-problem)
3. [Users and value propositions](#3-users-and-value-propositions)
4. [Core concept: atomic implementation intelligence](#4-core-concept-atomic-implementation-intelligence)
5. [Illustrative case study](#5-illustrative-case-study)
6. [Product capabilities](#6-product-capabilities)
7. [User journeys and permissions](#7-user-journeys-and-permissions)
8. [Evidence, editorial quality, and trust](#8-evidence-editorial-quality-and-trust)
9. [AI extraction and comparison engine](#9-ai-extraction-and-comparison-engine)
10. [Data model](#10-data-model)
11. [Technical architecture](#11-technical-architecture)
12. [Security, privacy, and content rights](#12-security-privacy-and-content-rights)
13. [Business model](#13-business-model)
14. [Competitive landscape](#14-competitive-landscape)
15. [Scope and roadmap](#15-scope-and-roadmap)
16. [Success measures and validation](#16-success-measures-and-validation)
17. [Risks and mitigations](#17-risks-and-mitigations)
18. [Open product decisions](#18-open-product-decisions)
19. [Initial implementation backlog](#19-initial-implementation-backlog)
20. [References and independence](#20-references-and-independence)

---

## 1. Vision and positioning

### Vision

Make practical knowledge about enterprise technology implementations easier to discover, compare, scrutinise, and reuse.

### Mission

Build a trusted platform where companies contribute implementation experiences and readers can investigate **what was done**, **under which circumstances**, **with which tools**, **at what cost or risk**, and **with what evidence of an outcome**.

### Product promise

- **For readers:** Move from promotional success stories to actionable implementation evidence.
- **For publishers:** Turn completed work into credible, discoverable proof of capability and practical expertise.
- **For research teams:** Compare repeatable implementation activities across industries, technology stacks, and organisations.

### Positioning

**An implementation-evidence network, not a general-purpose analyst firm.**

Research and advisory services can help organisations evaluate markets, vendors, strategy, and technology opportunities. This platform focuses more narrowly on reconstructing and comparing **execution**: the tasks performed, decisions made, dependencies encountered, trade-offs accepted, and outcomes measured.

**Launch niche:** enterprise AI and automation case studies. Expand into cloud, cybersecurity, data, ERP, software modernisation, and operational transformation only after the classification and verification model works well in one domain.

## 2. The problem

Traditional case studies are often scattered across vendor websites, consultancy portfolios, PDFs, news articles, and private customer presentations. They tend to differ in structure and the degree of evidence available.

Common limitations include:

- **Marketing bias:** Many stories emphasise successes and omit setbacks, implementation costs, or failures.
- **Limited comparability:** Two studies describing “AI-powered onboarding” may measure different outcomes under very different conditions.
- **Missing implementation detail:** An impressive result rarely explains the dependencies and intermediate activities necessary to reproduce it.
- **Weak discoverability:** Readers must know which organisation, tool, or buzzword to search for.
- **Unclear evidence:** A published percentage improvement may lack a baseline, sample size, time period, or supporting source.
- **Knowledge fragmentation:** Reusable lessons stay buried inside long articles rather than becoming cross-study insights.

### The opportunity

Preserve the original narrative while creating a second, structured layer of **atomic implementation steps**, each linked to its evidence. Over time, these steps can connect otherwise unrelated case studies and reveal patterns in how organisations solve specific business problems.

## 3. Users and value propositions

| Persona | Primary goal | Proposed value |
| --- | --- | --- |
| Technology leader / CIO | Evaluate implementation options | See actual delivery patterns, risks, prerequisites, and outcomes |
| Enterprise architect / engineer | Understand how a solution was built | Inspect workflow steps, systems, integration points, and technical decisions |
| Transformation / operations leader | Improve a business process | Find analogous processes and practical lessons across industries |
| Analyst / consultant | Research implementation patterns | Search atomic tasks, compare evidence, create research collections |
| Vendor / consultancy contributor | Demonstrate expertise | Publish verified work and attract relevant professional interest |
| Customer case-study owner | Share an implementation responsibly | Review claims, control disclosures, and approve the published version |
| Editor / platform administrator | Maintain quality and safety | Verify submissions, resolve ambiguities, monitor conflicts, and manage corrections |

### Initial target market

Start with professionals evaluating **AI workflow automation**, **document processing**, **customer support automation**, **knowledge retrieval**, and **internal enterprise copilots**. These themes lend themselves to decomposable tasks but still require meaningful human, organisational, and governance context.

## 4. Core concept: atomic implementation intelligence

An **atomic implementation step** is the smallest *usefully independent* activity described in a case study. It must be specific enough to compare with similar work elsewhere, but not so fine-grained that it becomes meaningless technical trivia.

A useful step should normally have:

1. **A single clear objective:** What was the activity trying to accomplish?
2. **An input and output:** What entered the activity, and what changed or was produced?
3. **An actor or system:** Who or what performed it?
4. **A method or technology:** How was the activity carried out?
5. **Dependencies and constraints:** What needed to happen before it could succeed?
6. **Evidence or a disclosure gap:** What source supports the description or outcome?

> Atomic does **not** mean every CPU instruction, API call, or tiny user action. Granularity is determined by whether the step is meaningful to business or technical decision-making.

### Three distinct objects

| Object | Meaning | Example |
| --- | --- | --- |
| **Case study** | A whole implementation in one organisation | A bank modernises document-based onboarding |
| **Case-specific step** | Something observed or reported in that particular implementation | The bank uses OCR to extract applicant data from scanned forms |
| **Canonical task** | A normalised reusable task definition | Extract structured fields from unstructured documents |

A case-specific step maps to one or more canonical tasks. That mapping enables cross-company comparisons without erasing the original context.

### Additional relationships

- **Steps have ordering and dependencies:** “Validate extracted fields” may depend on “Extract document fields”.
- **Steps use technologies:** A task can involve multiple systems, models, vendors, and human interventions.
- **Steps have outcomes:** Metrics may be measured directly, reported by the contributor, estimated, or unavailable.
- **Steps have evidence:** Claims point back to documents, interviews, charts, or other permissioned references.
- **Canonical tasks have versions:** The taxonomy can evolve without rewriting the original historical record.

### Examples of later insights

- Which approaches to invoice extraction appear across finance, logistics, and healthcare?
- What manual approvals commonly remain even after a process is “automated”?
- Which integration dependencies regularly delay rollout?
- When do reported gains in processing speed coincide with higher review workloads?
- Which techniques are associated with good results, and **under what conditions**?

Correlation is not causation. The platform should not claim that a vendor or method caused an outcome merely because they appear together in a published case study.

## 5. Illustrative case study

**Example (fictional): AI-assisted customer onboarding for a financial-services business.** All outcomes below are illustrative, not empirical claims.

**Business problem:** Manual checks on onboarding documents delay applications, create inconsistent handling, and require substantial administrative effort.

**Proposed solution:** A partly automated workflow processes documents, validates extracted data against rules, and sends exceptions for human review.

| Step | Atomic activity | Mode | Dependency | Useful evidence |
| --- | --- | --- | --- | --- |
| 1 | Receive and classify incoming documents | Software / AI | Upload and storage access | File-type coverage and error rate |
| 2 | Extract structured fields | AI-assisted | Document classification | Extraction accuracy by document category |
| 3 | Validate values against rules and records | Hybrid | Extracted fields and system access | Exception and false-positive rates |
| 4 | Route uncertain cases for human review | Human-led | Confidence / policy threshold | Review time and escalation frequency |
| 5 | Update onboarding system | Automated with controls | Approved data | Write success and audit outcomes |
| 6 | Measure operational performance | Human / analytics | Event instrumentation | Comparable before/after measurements |

### What a reader should learn

- The original business objective and the organisation's operating context.
- The workflow and which steps were automated versus human-led.
- Data access, model limitations, policy constraints, and integration dependencies.
- Outcomes with baselines, measurement windows, and uncertainty where available.
- Challenges, unsuccessful approaches, and lessons learned.
- Whether the case plausibly applies to their own circumstances.

## 6. Product capabilities

### 6.1 Reader-facing discovery

- Homepage with featured, recent, and editorially selected case studies.
- Search by business problem, industry, workflow, atomic task, technology, vendor, and desired outcome.
- Filters for industry, company size (when disclosed), technology, geography, publication date, evidence level, and implementation maturity.
- Case-study cards with an honest summary, publisher, industry, topic, date, and verification status.
- Two reading modes: **Narrative view** (full story) and **Atomic view** (structured steps and dependencies).
- Source-linked metrics, challenges, technical notes, and limitations.
- Bookmarks and personal research collections.

**Later:** semantic question answering, side-by-side comparisons, saved organisation workspaces, exports, watchlists, and implementation playbooks.

### 6.2 Company profiles and submissions

- Verified organisation profiles and domain association.
- Requests for publishing privileges, reviewed by the platform team.
- Submission form with structured prompts and document uploads.
- Drafts, revisions, editorial feedback, and approval history.
- AI-assisted decomposition **as a draft**, never automatic publication.
- Optional company or customer approval before public release.
- Published study management, corrections, withdrawal requests, and version history.

**Contributor incentives:** discoverability, professional credibility, referrals (only with reader consent), and insight into aggregated engagement. A publisher's own claims must be labelled as such.

### 6.3 Editorial operations

- Submission queue and reviewer assignment.
- Source provenance and permissions checklist.
- Compare original source text to extracted atomic steps.
- Evidence and conflict-of-interest flags.
- Canonical task matching and taxonomy maintenance.
- Approval, rejection, revision, and correction workflows.
- Complete audit trail for published changes.

### 6.4 Research and intelligence (later phases)

- Cross-study task similarity and related-case recommendations.
- Controlled comparisons by business context and metric definition.
- Technology and integration dependency maps.
- Evidence-backed reports and implementation checklists.
- AI assistant that cites accessible source material and states uncertainty.
- Private organisation-specific analyses under an enterprise plan.

## 7. User journeys and permissions

### 7.1 Reader sign-up

1. Visitor views public landing information and limited study previews.
2. Reader registers with a work email and verifies control of that inbox.
3. The system resolves the email domain to an organisation when appropriate.
4. Reader gains access to available published studies.
5. Reader can save studies, manage profile details, and request contributor access if authorised.

**Important:** Work-email verification establishes mailbox control, **not** automatically employment status or authority to speak for a company. Domain matches are subject to review. A flexible access policy may later support consultants, researchers, students, and people without corporate domains.

### 7.2 Company publishing request

1. An individual requests a company publishing account.
2. Platform staff verify business identity and representative authority (e.g. verified domain DNS, approved business contacts, or other documentary checks).
3. An organisation administrator is approved to manage contributor members.
4. A contributor creates a draft and supplies claims, data, sources, and publication permissions.
5. AI proposes structured atomic steps for human review.
6. An editor checks the submission and requests any necessary corrections.
7. Authorised parties approve publication; the platform publishes a versioned record.

### 7.3 Roles

| Role | Permissions |
| --- | --- |
| Visitor | Marketing pages and public previews |
| Verified reader | Read eligible published case studies; bookmark and search |
| Contributor | Create and edit own organisation's drafts |
| Organisation admin | Manage authorised members and approve organisational submissions |
| Editor / reviewer | Review submissions, inspect evidence, suggest revisions, approve within policy |
| Platform admin | Configure taxonomy, organisations, policies, moderation, and system access |

Use **server-side authorisation** for every operation. A shared email domain must not automatically grant access to a company's private drafts or unpublished evidence.

### 7.4 Suggested case-study states

`draft → submitted → under_review → changes_requested → approved → published`

Additionally support `rejected`, `archived`, `withdrawn`, and a correction workflow that creates a new published version without silently changing historical evidence.

## 8. Evidence, editorial quality, and trust

**Trust is a product feature, not a badge generated by AI.**

### 8.1 Separate the levels of assurance

Use plain-language labels, potentially including:

- **Company-submitted:** Content supplied by a company; no independent verification implied.
- **Editorially reviewed:** Editors assessed consistency, attribution, rights, and clarity, but may not have independently validated outcomes.
- **Supporting documents reviewed:** Relevant original records were inspected, subject to disclosure limits.
- **Independently corroborated:** Specific claims were checked against independent or primary evidence using a documented process.

Never imply that every fact in a study is independently verified when only selected claims have been checked.

### 8.2 Claims and metrics

Each material claim should store:

- Wording as reported by its source.
- Claim type (fact, reported outcome, estimate, interpretation, projection).
- Source and precise excerpt, page, or permitted link.
- Baseline, end value, unit, timeframe, sample, and measurement method when available.
- Who supplied and who reviewed it.
- Confidence / assurance notes and any unresolved caveats.

Example: “Processing time improved by 40%” is incomplete unless readers can see what was timed, the original baseline, how long measurement lasted, and who reported the figure.

### 8.3 Failure and limitation data

Require dedicated submission fields for:

- Approaches considered but not selected.
- Unexpected integration or operating costs.
- Failed pilots and workarounds.
- Data-quality and human-review bottlenecks.
- Security, governance, legal, and organisational constraints.
- What the contributor would do differently.

Accept redactions where necessary, but indicate that information has been withheld.

### 8.4 Editorial independence

- Payment must not purchase favourable evidence assessments or conclusions.
- Sponsorship and conflicts of interest must be disclosed.
- Research comparisons should not silently prioritise paying publishers.
- Provide a published corrections policy, appeals process, and right-of-reply procedure.

## 9. AI extraction and comparison engine

### 9.1 Proposed pipeline

1. **Ingest:** Accept structured submissions and permissioned attachments.
2. **Parse:** Extract text with document and source location metadata; record parser limitations.
3. **Segment:** Identify business objectives, phases, activities, constraints, metrics, and claims.
4. **Decompose:** Generate candidate atomic steps with inputs, outputs, actors, tools, and dependencies.
5. **Ground:** Associate every extracted claim with a source excerpt or mark it unsupported.
6. **Normalise:** Propose mappings to canonical tasks using embeddings and constrained classification.
7. **Validate:** Run schema checks, contradiction checks, duplicate detection, and targeted human review.
8. **Approve:** Store the edited, versioned result with reviewer and provenance details.
9. **Index:** Update keyword and vector indexes for published, authorised content only.
10. **Monitor:** Track corrections, taxonomy drift, and quality metrics.

### 9.2 Canonical task matching

- First retrieve plausible existing canonical tasks using hybrid lexical/vector search.
- Compare objective, input/output, domain context, and granularity—not just wording.
- Require a reviewer to confirm low-confidence matches or creation of new canonical tasks.
- Preserve raw submitted wording even when a canonical mapping is approved.
- Allow taxonomy merges, splits, and version changes without losing provenance.

### 9.3 Comparison safeguards

Metrics should only be compared when their **units, baselines, populations, time windows, and operating contexts** are meaningfully compatible. Otherwise show a qualified qualitative comparison rather than an aggregate number.

Never automatically infer:

- Causal impact from co-occurrence.
- ROI where cost and benefit figures are incomplete.
- A universal “best” vendor from a self-selected set of contributor case studies.
- Technical feasibility, legality, or safety from the mere existence of an implementation.

### 9.4 AI governance

- Extraction is **assistive**; publication remains human-approved.
- Do not train third-party models on unpublished contributor materials without explicit rights and a deliberate policy.
- Avoid including private uploads in logs, public search indexes, or unapproved retrieval contexts.
- Store model, prompt version, extraction schema version, and job status for reproducibility.
- Evaluate outputs on a human-labelled set before enabling automated workflow steps.

### 9.5 Optional assessment dimensions

Keep these separate rather than compressing them into one opaque number:

- Technical / operational feasibility.
- Implementation complexity.
- Potential business impact.
- Risk and human-oversight burden.
- Strength of supporting evidence.
- Transferability to other contexts.

Scores are **assessments** unless directly observed and should display definitions, assumptions, and uncertainty.

## 10. Data model

**Illustrative initial PostgreSQL entities:**

| Entity | Key fields / purpose |
| --- | --- |
| `users` | Identity, profile, verification status |
| `organizations` | Name, profile, legal / review status |
| `organization_domains` | Domain, verification mechanism, status |
| `organization_memberships` | User, organisation, role, approval |
| `publishing_requests` | Applicant, company, authority evidence, decision |
| `case_studies` | Owner, slug, scope, industry, summary, visibility, status |
| `case_study_versions` | Immutable published snapshots and edit history |
| `case_study_sources` | Permissioned files / links, ownership, access rules |
| `atomic_steps` | Study version, title, objective, input/output, actor, order |
| `step_dependencies` | Predecessor and successor, dependency type |
| `canonical_tasks` | Normalised task definitions, taxonomy version |
| `step_task_mappings` | Step, canonical task, status, reviewer, rationale |
| `technologies` | Tool / product / vendor identifiers and aliases |
| `step_technologies` | Step-to-technology associations |
| `claims` | Statement, type, qualifiers, original source reference |
| `outcome_metrics` | Value, unit, baseline, period, measurement context |
| `evidence_reviews` | Assurance level, reviewer, notes, decision |
| `submissions` | Draft/review lifecycle, assigned reviewer |
| `bookmarks` / `collections` | Reader-saved content |
| `audit_events` | Sensitive changes and reviewer decisions |
| `processing_jobs` | Async ingestion, extraction, indexing, retries |

### Design rules

- Use stable IDs and version important published records.
- Store source citations at the **claim/step** level, not only at the article level.
- Separate confidential originals from public excerpts.
- Model many-to-many task, evidence, and technology relationships explicitly.
- Use PostgreSQL Row Level Security or an equivalent robust server-side policy boundary.
- Treat `organisation membership` and `publishing permission` as different entitlements.

## 11. Technical architecture

### Proposed stack

| Layer | Initial choice | Reason |
| --- | --- | --- |
| Web app | Next.js (App Router), TypeScript, Tailwind | Fast development and modern B2B UX |
| Authentication | Supabase Auth | Email verification and extensible identity management |
| Database | PostgreSQL | Strong relational structure and transactional workflows |
| Search | PostgreSQL full-text + pgvector | Hybrid keyword and semantic retrieval without extra infrastructure |
| API | Type-safe Next.js services / tRPC | Shared schemas and consistent access control |
| AI processing | Python worker, schema-validated LLM calls | Flexible extraction and evaluation pipelines |
| File storage | Private object storage, e.g. Cloudflare R2 | Cost-controlled storage with signed access |
| Jobs | Durable queue / worker | Safe asynchronous parsing and extraction |
| Payments (later) | Stripe or equivalent | Paid individual and organisation plans |
| Observability | Error tracking, audit logs, metrics | Operational and editorial traceability |

### Logical architecture

```text
Browser / Next.js
  ├── Public website and reader experience
  ├── Company submission portal
  └── Editorial administration
           │
           ▼
  Auth + Application Services
    ├── Organisation and permission checks
    ├── Case studies and versioned publishing
    ├── Search / collections / comparisons
    └── Submission review workflow
           │
      ┌────┴─────────────────────┐
      ▼                          ▼
 PostgreSQL + pgvector     Private object storage
      │                          │
      └──────────┬───────────────┘
                 ▼
          Durable job queue
                 ▼
          Python AI workers
      Parse → Extract → Ground → Map → Validate
                 │
                 ▼
          Human editorial review
                 │
                 ▼
             Publish / Index
```

### Engineering principles

- Start as a **modular monolith**; split services when operational demands justify it.
- Do not introduce a graph database unless actual query patterns require one.
- Use versioned structured-output schemas and idempotent processing jobs.
- Separate unpublished material from public search indexes and caches.
- Make every sensitive transition observable and auditable.
- Build for corrections and deletion from day one.

### Suggested high-level routes (not implemented)

- `/` — marketing and featured studies
- `/explore` — browse, search, filter
- `/cases/[slug]` — narrative and atomic views
- `/tasks/[slug]` — canonical task and related implementations (later)
- `/companies/[slug]` — verified company profile
- `/collections` — saved research
- `/submit` — contributor drafts and submission
- `/company/settings` — publisher administration
- `/editorial` — restricted review dashboard
- `/account` — profile and preferences

## 12. Security, privacy, and content rights

### Authentication and organisation identity

- Verify email ownership; separately verify company-control claims.
- Use least-privilege roles and server-side resource checks.
- Support future OIDC/SAML SSO and domain-based invitations for enterprises.
- Do not grant access to sensitive material merely because email domains match.
- Apply rate limits, anti-abuse measures, and appropriate multi-factor authentication for privileged roles.

### Privacy and confidentiality

- Minimise collected personal data and restrict access by purpose.
- Obtain explicit submission permissions; provide redaction tools before publication.
- Default uploaded source documents to private; use scoped signed URLs when needed.
- Establish clear retention, withdrawal, and deletion policies with contractual/legal exceptions.
- Publish transparent terms, privacy notices, and AI-processing disclosures.
- Assess applicable legislation (e.g. Australian privacy requirements and, when relevant, GDPR) before launching in those markets.

### Intellectual property

- Contributors must attest that they have rights to submit and publish content, images, client names, data, and quotations.
- Customer references and endorsements should require appropriate authorisation.
- Do not republish third-party reports or copyrighted case studies merely because they are publicly accessible.
- Respect licences and access restrictions for external sources, including analyst research.
- Have procedures for takedown claims, corrections, and disputed ownership.

### Research integrity

- Label sponsored content and contributors' commercial relationships.
- Prevent model-generated claims from being displayed as empirical facts.
- Maintain a content provenance trail and clear reviewer responsibilities.

## 13. Business model

### Proposed pricing tiers

| Tier | Audience | Potential offering |
| --- | --- | --- |
| **Free reader** | Verified professionals | Published studies, basic search, atomic views, limited collections |
| **Pro** | Individual analysts / consultants | Advanced comparison, research exports, richer AI analysis |
| **Enterprise** | Teams / companies | Shared workspaces, SSO, private collections, custom analysis, controls |
| **Publisher** | Contributors | Free basic publishing; optional analytics, profile management, editorial services |

**Principle:** Publication payment must not influence editorial assessments, claimed verification, or evidence-based rankings.

Potential later revenue: enterprise seats, proprietary data analysis, custom commissioned research, or transparent sponsorship. Test whether readers will pay for **actionable comparisons** before designing complex pricing.

## 14. Competitive landscape

| Alternative | What it does well | Proposed distinction |
| --- | --- | --- |
| Gartner and established advisory firms | Analyst research, market guidance, proprietary datasets, strategic evaluation | Focus on comparable execution steps and traceable implementation-level evidence |
| Gartner Peer Insights / buyer review communities | Practitioner feedback about technology products | Model the actual implementation workflow, not primarily product experience |
| Vendor / consultancy case-study libraries | First-hand project descriptions and customer storytelling | Cross-company normalisation, structured failures, and evidence comparisons |
| Consulting and systems integrators | Detailed delivery expertise | Discoverable, reusable cross-organisation knowledge, with limits clearly stated |
| Generic search and AI chat tools | Broad retrieval and synthesis | Permissioned, structured, versioned, reviewed case-study dataset |

**Reality check:** Gartner already offers AI use-case evaluation and AI-assisted research. This product should not be positioned as the only place to get AI use cases or evidence-backed answers. Its differentiation must be the **quality, granularity, and comparability of implementation records**.

## 15. Scope and roadmap

### Phase 0 — Discovery and validation

**Goal:** Prove that contributors will disclose useful details and readers find the atomic structure valuable.

- Interview 10–15 prospective readers and 5–10 potential publishing partners.
- Obtain permissioned seed studies from a small group of companies.
- Manually decompose approximately 20–30 studies and refine task granularity.
- Run side-by-side tests: conventional article vs atomic view for actual research questions.
- Define editorial standards, claims taxonomy, and a practical rights checklist.

**Exit criterion:** Readers demonstrably complete at least one research task more effectively with the atomic format, and multiple contributors are willing to supply repeatable evidence.

### Phase 1 — MVP: case-study billboard

**Goal:** Deliver a usable publishing and discovery product.

**Must have:**
- Responsive landing page, browsing, filters, and case-detail pages.
- Verified reader accounts and basic organisation association.
- Publisher applications and manual approval.
- Company-managed case-study drafts and attachments.
- Editorial submission, review, publish, and correction workflow.
- Simple atomic steps entered or edited by humans.
- Source links, disclosure labels, security baseline, and audit trail.

**Not required yet:** Full automated decomposition, vendor ranking, a chatbot, paid plans, or a graph database.

### Phase 2 — Atomic extraction and taxonomy

**Goal:** Make structured decomposition efficient and consistent.

- AI-generated candidate steps with citations to exact source segments.
- Reviewer UI for editing, reordering, approving, and rejecting steps.
- Canonical task library and suggested task matching.
- Step dependencies, technology links, outcome metrics, and limitations.
- Hybrid full-text / semantic search.
- Quality-evaluation dataset and extraction metrics.

### Phase 3 — Comparative intelligence

**Goal:** Produce valuable insights across submissions.

- Side-by-side case and step comparisons.
- Comparable-metric rules and evidence qualifiers.
- Related-task discovery, saved research, and report exports.
- First pilot of a professional subscription.

### Phase 4 — Enterprise research tools

**Goal:** Turn the evidence network into a repeatable research workflow.

- Grounded question answering and cited implementation playbooks.
- Team workspaces, enterprise identity integration, private research collections.
- Custom analysis and advanced benchmarking where data quality permits.
- Controlled API access and integrations if customers demand them.

**Sequence rule:** Data rights, editorial controls, and comparable evidence come before ambitious predictive or advisory features.

## 16. Success measures and validation

### Supply-side indicators

- Number of active publishing organisations.
- Percentage of submissions accepted with adequately supported claims.
- Median editorial turnaround and revision rounds.
- Percentage of studies with meaningful limitations or failure disclosures.
- Percentage of published steps linked to a source reference.

### Demand-side indicators

- Reader activation: verified users who open and meaningfully engage with a study.
- Search-to-useful-result rate (user feedback or task-completion tests).
- Repeat research sessions and saved collections.
- Number of cross-study comparisons completed.
- Willingness to pay for research outputs, not just page views.

### Intelligence quality indicators

- Step extraction precision / recall on a human-labelled benchmark.
- Canonical task mapping agreement among reviewers.
- Unsupported-claim rate and correction frequency.
- Proportion of benchmark comparisons with compatible metrics.
- Citation accuracy in AI-generated answers.

### Suggested pilot questions

1. Can a reader identify the essential steps of an implementation faster than by reading conventional case studies?
2. Can two independent reviewers produce similar atomic decompositions using the same guidelines?
3. Can the system find genuinely comparable steps across unrelated publishers?
4. Will contributors provide operational detail beyond promotional narratives?
5. Will a research or technology team pay for cross-case evidence analysis?

## 17. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Cold-start content supply | Sparse results and weak discovery | Curated, permissioned launch collection; contributor partnerships |
| Promotional-only submissions | Low research value | Structured challenge/limitation fields; evidence policies; editorial review |
| Confidentiality and IP disputes | Legal and reputational harm | Rights attestation, redaction, approvals, clear takedown process |
| AI hallucinated steps or outcomes | Misleading analysis | Source grounding, schema checks, human approval, audits |
| Poor canonical taxonomy | Bad matching and comparisons | Versioned taxonomy, reviewer guidance, merge/split procedures |
| Misleading aggregate benchmarks | Incorrect decisions | Comparability rules, transparent sample sizes, uncertainty labels |
| Company identity abuse | Unauthorised publishing or access | Distinct mailbox, domain, and representative verification procedures |
| Enterprise procurement friction | Slow adoption | Start with free research use and a small focused segment |
| Reader trust and neutrality | Perceived pay-to-play | Disclose sponsorship; separate commercial and editorial control |
| High AI processing cost | Unfavourable unit economics | Batch processing, caching, lightweight model routing, evaluation before scaling |

## 18. Open product decisions

These should be answered through user research rather than assumed:

1. Should a full work-email registration be required for *reading*, or only for contributing and premium research?
2. Who owns publication authority when a consultancy documents work carried out for a customer?
3. Which studies can be published anonymously, and which require a named client?
4. What evidence level is required before a study is discoverable or labelled “verified”?
5. How much implementation detail must a case contain to be accepted?
6. Should canonical tasks be cross-industry from the start or divided by business domain?
7. Are company-submitted studies, commissioned studies, and independent editorial studies displayed differently?
8. What first paid workflow is compelling enough to support a subscription?
9. How are withdrawn claims reflected in AI-generated insights and cached research outputs?
10. What is the preferred long-term name, domain, and brand identity?

## 19. Initial implementation backlog

### Epic A — Product foundation

- [ ] Choose working product name and visual identity.
- [ ] Initialise Next.js application and PostgreSQL project.
- [ ] Define database migrations, development environments, and CI checks.
- [ ] Implement authentication, email verification, and role-based authorisation.
- [ ] Create organisation records and conservative domain-association rules.

### Epic B — Reader experience

- [ ] Build landing page, case catalogue, search, and filters.
- [ ] Create case-detail page with narrative and atomic tabs.
- [ ] Add industry/technology labels and related-case navigation.
- [ ] Add bookmarks and basic profile management.

### Epic C — Publisher and editorial workflows

- [ ] Build publishing application and approval process.
- [ ] Build structured case submission, edit, save, and attachment handling.
- [ ] Add source permissions and claims evidence checklist.
- [ ] Build editorial queue, reviewer feedback, and publish transitions.
- [ ] Store immutable published versions and audit events.

### Epic D — Atomic model

- [ ] Define atomic step and canonical task schemas.
- [ ] Create a human-editable step list and dependency editor.
- [ ] Build a small reviewed seed taxonomy from pilot studies.
- [ ] Ensure source-level evidence links and assurance labels are visible.

### Epic E — Quality and launch

- [ ] Establish content rights, privacy, and correction policies.
- [ ] Set up monitoring, backups, permission tests, and abuse controls.
- [ ] Recruit initial publishing partners and curate launch studies.
- [ ] Test the full workflow with real reader research tasks.
- [ ] Record pilot feedback and revise MVP scope before adding advanced AI.

### MVP definition of done

A verified reader can discover and read an approved case study in both narrative and structured-step form. An authorised company contributor can submit a draft, an editor can review evidence and request changes, and an approved version can be published with visible provenance, rights controls, and a correction path. No AI-generated material can be published as verified fact without appropriate review.

## 20. References and independence

The atomic-task concept is **inspired by the general principle of decomposing complex work into meaningful, assessable units**, including ideas publicly described by [PlanckPoint Research's AtomicAI](https://planckpointresearch.com/). This proposed platform applies decomposition to **published implementation evidence**, which is a distinct use case. It is **not affiliated with, endorsed by, or a reproduction of** PlanckPoint Research or AtomicAI; no proprietary methodology is claimed or incorporated.

For competitive context, see [Gartner AI](https://www.gartner.com/en/ai), [Gartner AI Use Case Insights](https://www.gartner.com/en/products/ai-use-case-insights), and [AskGartner](https://www.gartner.com/en/products/ask-gartner-faqs). These products already provide substantial AI use-case and evidence-based research capabilities. The proposed differentiation here is implementation-step granularity and consistent cross-case provenance, **not** an assertion that Gartner does not perform use-case or implementation research.

---

## Project status and contribution policy

**Current phase:** concept definition and discovery. Repository structure, operating procedures, installation instructions, API contracts, and licensing should be added once implementation begins. Until a licence is explicitly selected, **no open-source licence is granted by this README**.

**Near-term priority:** Validate the research value of atomic case-study decomposition and the willingness of real organisations to contribute detailed, permissioned implementation evidence **before** scaling the technical platform.
