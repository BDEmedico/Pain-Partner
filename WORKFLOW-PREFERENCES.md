# Pain Partner — current approved preferences

This is the single policy source. It replaces the chronological accumulation of older rules; Git history preserves that history. Current patient-specific instructions override it. Regional examination macros live only in `skills/clinic-visit/references/physical-exam.md`; procedure defaults live only in the editable `procedure-note-builder.html`. Bundled copies are generated, never separately edited.

## 1. Sources and patient identity

- Read the actual supplied previous note, encounter material and images. A preview, recollection or prior summary is not a substitute for reading an available source. Never claim a transcript or HTML was read or a generator run if it was not.
- Keep patients separate. Use the identified patient; ask only if identity cannot be resolved safely. Retain age and established facts from the previous note unless corrected. Do not import another patient's targets, medicines, dates or follow-up.
- Current clinician corrections and decisions take precedence over earlier records. Resolve clear transcription errors; retain and flag material unresolved conflicts in side, level, drug, dose, negation or anatomy. An explicit correction settles that issue; do not keep asking.
- Distinguish raw transcripts from generated summaries. Generic AI-normal prose does not invoke a normal examination macro. Do not invent clinical findings, red-flag negatives, counselling, diagnoses, medication changes or completed actions outside the specific authorized procedure defaults below.
- Accepted diagnoses are stated directly (e.g. `Diabetes`), without `from intake`. Preserve attribution when it matters: uncertainty, chronology, consultant opinions and conflicting sources.
- Use the client date in America/Regina only when the service date is not supplied. Historical results and examinations retain their own dates.

## 2. Full chart continuity and concise prose

- A procedure encounter updates the previous full chart; it does not replace it with an abbreviated procedure-only summary. Preserve medical/surgical history, current medicines, allergies, social history, treatments, relevant investigations, baseline pain history and previous examination. Do not drop these sections or replace them with `relevant history includes...` unless Victoria requests a focused note.
- Preserve her edited wording, section labels, paragraph organization and historical examination where sound. Update encounter-specific content rather than restyling an unchanged HPI, imaging summary or examination. Correct transcription errors and reconcile actual contradictions; preservation does not mean retaining stale negatives or duplicate sections. Compact within sections, not by deleting sections or established facts. Do not repeatedly shorten an already approved summary.
- Carry forward the accepted IMPRESSION verbatim. When new evidence changes the assessment, edit only the affected sentence or add a short update. New investigations or a meaningful treatment response may justify a change; routine follow-up or performance of a planned procedure alone does not. Update the current procedure documentation and PLAN separately without restyling the accepted assessment.
- For follow-ups, PAIN HISTORY carries baseline symptoms/function and relevant earlier course; INTERIM HISTORY contains current interval symptoms, prior-treatment response and decisions. Put today's needle/contrast details in the procedure narrative. A material procedural result can be interpreted briefly in IMPRESSION without retelling the technique.
- Use normal clinical chart headings. Medical history, surgical history and previous medications are compact paragraphs; complex histories may be grouped for readability. CURRENT MEDICATIONS is one inline paragraph with supported doses/frequencies, not a vertical bullet list. Never resolve conflicting medication doses silently.
- INVESTIGATIONS (labs first) precedes PREVIOUS PAIN PROCEDURES. Keep each prior procedure to one concise entry: `DD-Mmm-YY: SIDE targets/procedure — key response and duration.` Use the approved procedure abbreviations and `B/L`; add a material technical limitation or dose only when useful. Preserve the available date precision rather than inventing a day. Do not infer historical doses from today's template or leave `No previous interventions` beside documented prior procedures.
- Preserve historical examination under the supplied `previous EXAM` label (clinic) or `Referral exam` (referrer), with date when known. Preserve supported compact grades, distributions, tests and abbreviations. Newly supplied findings belong under EXAM. No redundant `no examination` section for an already identified telephone encounter.
- Opening: chief complaint, then modality/purpose. For an initial phone consult use `This consultation was conducted by telephone to improve patient access, assess symptoms and discuss interventional options.` Do not use that initial-consult sentence indiscriminately for follow-ups.
- Use the referrer's name in HPI and `you/your` in IMPRESSION and PLAN; resolve recipient from CC. Do not invent a family physician. Use warm, plain, collegial prose without repeated caveats or appreciation paragraphs.
- Use connected sentences. Avoid duplicating the procedure list in interim history, impression and procedure title. Each fact has one main home; repeat only when it changes interpretation or is necessary for a clear plan.
- Keep the plan actionable and compact: follow-up ownership/modality/interval and the next actual or conditional decision. Do not repeat the impression's reasoning, add generic functional endpoints, or reactivate old administrative tasks/referrals without a current decision. Fuller explanation belongs in IMPRESSION when needed. Do not invent referrals, administrative chasing, automatic discharge back to a surgeon or fixed review intervals. Drafting does not send, order or book anything.
- Deliver one complete plain-text chart block with surname/mode outside. Editorial comments, template disclosure, material questions and billing review stay outside. Use a focused bracket choice only if genuinely needed, not for authorized defaults. Plain text does not guarantee clickable controls.

## 3. Performed procedures — required template use

- Read each applicable HTML entry plus shared consent, screening, local anesthetic, injectate and aftercare generation logic for the current encounter. Use full applicable defaults to minimize dictation. Do not invent a default or substitute an unrelated entry. Manual assembly from source is permitted; it is not an executed generator run.
- Actual procedure selection, side, targets and guidance come from the current case. Builder default selections do not authorize adding extra joints, nerves, sides or procedures.
- For TON/cervical MBB, US procedures are therapeutic; diagnostic blocks use Fluoro only. Use the HTML's modality-specific injectate defaults. This rule concerns these blocks, not unrelated US procedures.
- For selected performed procedures, use authorized defaults for routine consent, screening, positioning, needles, drugs/concentrations, technique and aftercare unless contradicted. For a planned procedure, applicable consent may be used, but never performed-technique or discharge statements.
- For an unnamed steroid in a clearly identified procedure, use the HTML's current procedure-family drug/concentration default without a routine confirmation question. An explicitly named drug/concentration or no-steroid instruction overrides it. Apply a dictated volume to the steroid only when the context identifies it as steroid volume; this does not turn every `1 cc injection` into a steroid dose. These defaults do not add steroid to diagnostic/local-anesthetic-only procedures or retroactively change prior records.
- **Allergies:** use `NKDA` when no drug allergy has been specified in any supplied record or current dictation. Victoria confirms she would dictate exceptions. Carry forward every known allergy/intolerance; never overwrite it with NKDA. Do not write `Drug allergies: to confirm` merely because today's dictation omits them. This is a disclosed clinician-authorized draft default, not independent verification.
- Keep known anticoagulants and antiplatelets (including ASA) in the screen. Template negative screening is an authorized performed-procedure default only; it must not overwrite documented drugs or become a general negative booking history. Do not invent hold/restart instructions.
- One grouped disclosure outside the note identifies undictated defaults, including screening and aftercare as applicable. Do not pepper the chart with default-confirmation placeholders. If no applicable entry is available, say so and identify the missing details instead of claiming template use.
- Actual events override success/normal defaults. Preserve technical limitations, alternative trajectories, accepted uncertain spread, reasons for stopping, actual administered quantities and adverse events. Do not retain successful selective spread, no-complication or stable-discharge wording when contradicted. If recovery after an adverse event is unknown, leave it unresolved for review; do not manufacture recovery.
- Technical limitations belong in the technique and, when needed, a brief interpretation. Concordant reproduction of usual pain is a procedural response, not automatically a complication. Preserve significant painful events, their course and actual adverse events; do not duplicate every limitation under Complications. Keep future needle-length/technical recommendations in the procedure narrative rather than repeating them in PLAN.
- Use the clinician's confirmed procedure name, e.g. `LEFT L5 selective nerve root block`, even when technically limited. Describe limitations in the narrative and qualify diagnostic interpretation. Do not automatically add `attempted` to the title because spread was inconclusive. A target actually abandoned without delivery must remain documented as not performed.
- Keep nerve-root target separate from access foramen. Diagnostic local-anesthetic root blocks are not automatically TFESIs. For steroid-only epidural followed by a root block use `lumbar_root_sequence`: initial contrast, steroid-only phase, withdrawal, repeat contrast, periradicular anesthetic. Preserve actual spread; withdrawal alone does not establish selectivity. Do not add an epidural local-anesthetic flush.
- Blood aspiration and joint-fluid aspiration are distinct. Negative blood aspiration does not exclude vascular placement. Do not claim ultrasound visualization for fluoroscopic or palpation-guided injections, or copy prior procedure spread/assistant/outcome as today's observation.
- Use cc for volumes and mg/mL for concentration. Put target-specific amounts in compact injectate bullets, using `+` between mixture components and numerals for site counts; contrast separately. State the starting drug/concentration, component volumes and allocation. Do not routinely append calculated mg totals or final diluted concentrations. Check volume, dilution, allocation across sites, total dose and cumulative exposure internally. Preserve a dictated unusual dilution and flag a material discrepancy outside the chart rather than silently substituting the usual mixture.

## 4. Procedure output format

- Keep the full chart's established section headings (MEDICAL HISTORY, EXAM, IMPRESSION, PLAN, etc.). Leave two blank lines before IMPRESSION.
- Under IMPRESSION, start the procedure portion with the inline label `Procedure performed: ...`, then `Performed by: ...`. **Do not add standalone PROCEDURE NOTE, PROCEDURES, CONSENT AND PREPARATION, TECHNICAL LIMITATIONS or per-target headings.** This supersedes the older instruction requiring a PROCEDURE NOTE wrapper.
- Approved concise procedure titles: `Procedure performed: Fluoro, SIDE targets/procedure` or `Procedure performed: US, SIDE targets/procedure`. Use `LEFT`, `RIGHT` and `B/L`, with no side for a midline target. Use `+` between procedures and retain each distinct side/target. In titles and concise plans/history use `Fluoro` and `US`, not `Fluoroscopy-guided` or `US-guided`.
- Approved abbreviations: `IA`, `TFESI`, `SNRB`, `ILESI`, `ESI`, `TON`, `MBB`, `ESP`, `TPI` and specifically `L5 DR block` for the L5 dorsal ramus block (never call it an L5 medial branch). Examples: `RIGHT L5 TFESI (L5–S1), supraneural`; `B/L L4–5, L5–S1 IA facets`; `RIGHT L3, L4 MBB + L5 DR block, diagnostic #2`; `LEFT TON + C3–C5 MBB, therapeutic`. Preserve the nerve-root/access distinction and actual diagnostic/therapeutic intent. Include block number or TPI count only when known. Put technical explanation in the narrative.
- Retain the builder's useful labels: `Consent and Preparation:`, `Preprocedural screen:`, `Injectate:` and `Complications:`. They are not extra all-caps headings. A label may sit on its own line; use natural paragraph breaks between general consent, procedure-specific consent, preparation and target technique.
- Write technique in connected paragraphs, introducing each target in the sentence (`The right SI joint...`). For multiple targets use short paragraphs without standalone `Right L5 ESP:` subheadings. Do not narrate the entire procedure again in the impression or plan.
- Preserve the template's substantive safeguards and actual exceptions; removing headings is not permission to omit content.
- `references/procedure-example.md` shows the consolidated layout using entirely synthetic content. It is a candidate for final visual approval, not a patient record or a source of clinical defaults.

## 5. Examination

- Read `references/physical-exam.md` and apply its supported macros exactly. A clinician's normal shorthand authorizes that macro; absent findings or an AI summary do not.
- Preserve specific abnormalities and partial findings. Do not replace supported grades/distributions with vague `strength preserved`, `tested distributions` or unnamed `positional and provocative manoeuvres`.
- Do not invent manoeuvre names from conversational fragments. Omit an unidentifiable test, preserve all other supported findings and flag a material gap outside the note. Do not weaken the entire examination because one test is unclear.

## 6. Prechart and clinical review

- Prechart merges referral, available reports, intake and medication records. Do not write a completed current exam or performed procedure. Add a separate prioritized differential, focused discriminating history/exam suggestions and actionable flags.
- Preserve patient-specific surgical candidacy, requested block intent and stated surgical follow-up. A referral alone does not establish operative candidacy or a plan to discharge the patient after the block.
- Medication dispensing is evidence of prescribing, not proof of current use. Reconcile with explicit patient/clinician statements and flag consequential conflicts. Do not infer diagnoses solely from drugs or stop longstanding medicines solely from an old fill date.
- Review chronology, symptoms/function, exam, imaging, response, interpretation and plan together. Distinguish historical/current red flags, missing documentation and demonstrated risk. Do not invent counselling or ask for irrelevant ideal-workup details.
- Maximum five material review findings; no manufactured warnings or generic teaching. Calibrate urgency to the actual case. Do not suggest waiting for new saddle numbness or bladder dysfunction to persist before urgent assessment.
- Quantify response when supplied: target pain vs total pain/needle soreness, percent change, duration and actual functional gains. Do not turn early analgesia into durable benefit, or infer improved activities that have not been attempted.
- US requisitions: at most three sentences when requested. Dedicated external letters use `referral-letter`; a definite referral plan may trigger a draft letter, never transmission.

## 7. Booking handoff

A phone visit with a definite procedure-booking decision gets a separate block. Conditional treatment, already performed procedures and ordinary follow-up alone do not trigger it.

```text
Please book:

Procedure: [guidance, uppercase confirmed side, procedure and targets]
Duration: 30 minutes
Anticoagulation: [known drug and plan / supported negative / please confirm]
Antiplatelets: [including ASA]
Steroid: [Yes / No / not confirmed]
Ativan: Please ask
```

- Thirty minutes is the default unless specified otherwise. When negative use is established use `None, please confirm.` Unknown antiplatelet status or an exclusion-of-ASA screen is not a full negative. Known drugs and actual instructions take precedence. Do not infer interruption plans.
- Ativan is a preference question, not a prescription. Retain relevant context (`used for the previous procedure`) and explicit restrictions.
- Name confirmed alternatives and timing directly (`LEFT L5 vs S1; level to be confirmed on procedure day`). Optional additions use `Possible RIGHT ...`; do not give the MOA `if clinically indicated/applicable` to interpret.
- For multiple appointments explicitly list `Procedure:` then `- Day 1: ...` and `- Day 2: ...`; `Duration: 30 minutes per appointment`. Preserve separate-day vs consecutive-day decisions and useful local-stay/surgeon-contact logistics. Do not day-number single appointments.
- When explicitly applicable, preserve Victoria's scheduling explanation: `We are limited to one epidural injection per day, so the left and right sides will be treated on separate days.` It is her practice constraint, not a universal medical or verified payer rule.
- Phenol booking appends the following two paragraphs, adapting pronouns only. No extra logistics headings/bullets, no invented warming method:

Once you have a date, let me know. I'll need to send the prescription to Medicine Shoppe on Baltzan.

Please task an MOA to take the phenol out of the fridge early on the morning of the procedure. Please book her later in the day (after 11 a.m.) so the phenol has time to warm. Please don't book on a Tuesday after a long weekend.

## 8. Procedure-day billing review

Source: user-supplied October 1, 2026 Saskatchewan payment-schedule excerpts, Section H 94H–158H and Section D 5D: https://publications.saskatchewan.ca/api/v1/products/129078/formats/157436/download . This is excerpt-based screening, not verification of every payer/specialty/virtual requirement.

- For applicable procedures identify the latest known same-physician visit service for the same/related condition, including intervening visits. Procedure date alone does not establish a visit service. Unknown history prevents a definite eligibility conclusion.
- User-selected conservative boundary: days 0–30 within the window, day 31 outside. The excerpt excludes a procedure-day visit when a related visit occurred within 30 days, with medically required new-condition/significant-change/specific-interval assessments requiring review. Do not assume automatic eligibility or exception precedence.
- Routine consent, site verification, explanation and preparation belong to the procedure fee even beyond 30 days. 5D requires history, complaint, function, examination, assessment, treatment/advice and record; do not invent these for billing.
- Brief billing review stays outside the note: service date, prior relevant visit, elapsed days, separate necessity and uncertainties. Do not extend these nerve-block rules automatically to peripheral joint/bursa codes or infer virtual eligibility.

## 9. Learning, verification and publication

- Anticoagulant instructions: prefer concrete weekdays, naming the last dose, the first omitted day and the restart day. User-approved rivaroxaban wording (when this is the clinician-selected plan):
  `Rivaroxaban plan:`
  `- If procedure on Tuesday, last day of blood thinner on Saturday (i.e. none on Sunday and onward). Restart on Wednesday if all feels well.`
  `- If procedure on Wednesday, last day of blood thinner on Sunday (i.e. none on Monday and onward). Restart on Thursday if all feels well.`
  This preserves communication style and an explicitly selected schedule, not a universal rivaroxaban hold protocol. Exact timing, procedure bleeding risk and individual factors still govern clinical suitability. Do not transplant these examples into a different encounter: document that patient's actual last dose and dictated restart instructions.

- When a final note is supplied as feedback, explain the lessons first and collaborate before saving. Do not save or push merely because feedback arrived. Explicit agreed save/update work is authorized.
- Every performed-procedure draft must follow `references/procedure-workflow.md` and its narrow verification stage. The verifier consults these rules and HTML; it does not maintain alternative clinical policies or rewrite acceptable prose.
- Local source changes, GitHub pushes, portable bundle builds and installed-plugin publication are separate states. Never claim account-wide updates without inspecting the installed version. If the host lacks execution/publication capabilities, say so; a skill instruction cannot guarantee an application-level delivery gate.
- No patient notes, uploads, identifiers, transcripts or credentials in the repository, tests or bundle. Tests use invented synthetic facts only. Live review files belong in temporary storage outside the repository.
- Preserve the editable HTML and referral capability. Named-colleague conventions: Dr. Brose is a hematologist; lifestyle medicine referrals mean Dr. Njaa. Apply names only in context, not as global speech substitutions.
