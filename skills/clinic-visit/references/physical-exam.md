# Agreed physical examination macros

For the assistant-operated clickable review workflow, use `exam-workflow.md` and the editable `exam-builder.html` (bundled under `assets/`). Its selectable lumbar/cervical/shoulder scaffolds and detailed macros are **not observed findings** and do not enlarge the normal shorthand definitions below. Populate supported components; use native choices for remaining findings. Selecting `null` deletes the containing choice, not a normal/negative finding. Missing detailed macros and unspecified brace semantics stay unresolved rather than being invented.

## Assembly rules

- Extract examination findings from the entire encounter dictation, including findings spoken during the impression and plan. Assemble them under EXAM.
- Expand a whole regional normal macro only when Victoria invokes it for the current encounter, including "otherwise normal" when the region and exceptions are clear. A normal finding for one component invokes only that component's agreed wording, not the whole regional macro. Neither requires Victoria to repeat the numerical grades already represented by her normal shorthand.
- Specific findings override the corresponding normal finding. Preserve other invoked normal findings. Example: "normal back exam, Fortin positive" retains the back macro but replaces its SIJ line with `- SIJ: Fortin positive [right|left|bilateral], cluster negative.` Pain across the back belongs in the history, unless specifically an examination finding.
- Include hip and GT components whenever the normal back macro is invoked. In a back-examination scaffold include these headings, but do not fabricate results if no macro or findings were supplied.
- If a clinically material assessment lacks examination support, flag the specific gap outside the note. Offer a focused selectable prompt there; embed one only if requested or useful for a genuine unresolved clinician-known finding. Do not infer a positive result from the diagnosis. Unresolved prompts are not completed clinical findings.
- Use the exact compact multi-select syntax below. Several maneuvers may be selected. Selection/highlighting depends on the destination editor and is not guaranteed by plain chat text. These approved prompts override older universal null-first syntax for examination prompts.
- Keep the normal SIJ line short. Do not expand or invent the maneuvers underlying "cluster negative" and do not repeatedly request a definition.
- Positive provocation findings should reflect the patient's typical pain where applicable. Preserve distinctions between pain, weakness, restriction and radiating symptoms.
- Preserve historical findings under `Previous EXAM` (clinic) or `Referral exam`, with date where known. When telephone modality is already clear, omit a redundant no-examination section. Do not carry previous findings forward as current.
- Check the whole note for clinical consistency. A normal macro does not establish a diagnosis. Keep material questions outside the copyable note, with focused prompts where helpful.

## Output consistency

For a current lumbar examination, render clinician-confirmed normal components as follows:

| Supported normal component | Agreed output |
| --- | --- |
| Lower-limb motor | `- Motor: L2–S1 5/5 B/L.` |
| Lower-limb light-touch sensation | `- Sensation: L2–S1 intact to light touch B/L.` |
| Patellar and Achilles reflexes | `- Reflexes: Patellar and Achilles 2+ B/L.` |

This translates Victoria's clinical shorthand; it does not infer normality from silence. A clinician's confirmation or correction that a component was normal is sufficient. Test instructions ("push", "relax"), an isolated "good" without an identifiable finding, or a reflex merely being elicited do not independently establish the full normal component. Preserve explicitly limited testing without adding untested distributions or grades. Component-only normal findings do not add gait, hip, GT or SIJ results.

Specific abnormalities replace only the affected normal finding. For example, "normal back exam except left ankle dorsiflexion 4/5" becomes `- Motor: L2–S1 5/5 B/L except left ankle dorsiflexion 4/5.` Keep the other invoked findings unless contradicted. Uncertainty about one component must not weaken the others.

Before delivering any consultation, follow-up, procedure note or revision, check both completeness and wording against the source: every supported component must be retained. When normality is established, do not substitute `normal`, `present`, `elicited`, `strength preserved` or `tested distributions` for the agreed grades and distributions. Do not use unnamed `positional and provocative manoeuvres`. Omit an unidentifiable test and flag it briefly outside the note when clinically material. The source-linked exam check verifies declared expected wording; it cannot decide what the transcript establishes.

## Normal back exam

```text
EXAM
- Motor: L2–S1 5/5 B/L. Heel and toe walking intact.
- Sensation: L2–S1 intact to light touch B/L.
- Reflexes: Patellar and Achilles 2+ B/L.
- SIJ: Fortin negative, cluster negative.
- Hip: ROM w/o typical pain. Log roll and FADDIR negative.
- GT: No pain with palpation or resisted hip abduction.
```

Optional supporting findings:

```text
- SIJ: positive [right|left|bilateral] [FABER|thigh thrust|distraction|Fortin|compression|sacral thrust].
- GT: positive [right|left|bilateral] [tenderness on palpation|pain with resisted abduction|pain with single-leg stance|pain with resisted external derotation].
- Deep gluteal: positive [right|left|bilateral] [sciatic notch tenderness|FAIR|Pace].
- Gluteal muscles: [right|left|bilateral] [tenderness|taut bands|trigger points reproducing typical pain].
```

Deep gluteal tests are optional, not automatically part of the normal back macro. Seated piriformis stretch and active piriformis tests may be added when performed. Sacral sulcus tenderness is not a substitute for sciatic notch tenderness. Local gluteal tenderness alone does not establish sciatic entrapment. Keep gluteal tendon findings under GT rather than duplicating them.

## Normal cervical exam

```text
EXAM
- Motor: C5–T1 5/5 bilaterally.
- Sensation: Intact and symmetrical to light touch in C5–T1 dermatomes.
- Reflexes: Biceps, brachioradialis and triceps 2+ bilaterally.
- Cervical: ROM w/o typical pain. Spurling negative.
- Myelopathy screen: Hoffmann negative. Tandem gait intact.
- Shoulder: ROM w/o typical pain.
```

Optional findings:

```text
- Cervical: positive [right|left|bilateral] [pain with extension/rotation|paraspinal tenderness|Spurling reproducing arm pain].
- Myofascial: [right|left|bilateral] [trapezius|levator scapulae|rhomboids|cervical paraspinals] [tenderness|trigger points reproducing typical pain].
- Occipital: positive [right|left|bilateral] [tenderness|Tinel reproducing typical pain].
```

A negative Hoffmann and normal tandem gait alone do not exclude myelopathy. Consider the complete history and examination when reviewing the impression.

## Normal shoulder exam

```text
EXAM
- Shoulder: Active and passive ROM w/o typical pain.
- Strength: Abduction, external and internal rotation 5/5.
- Palpation: No AC joint or bicipital groove tenderness.
- Rotator cuff: Painful arc, Hawkins and Jobe negative.
- Biceps: Speed's and Yergason's negative.
- AC joint: Cross-body adduction negative.
```

Optional findings:

```text
- Shoulder: [right|left|bilateral] [active|passive] ROM limited in [flexion|abduction|external rotation|internal rotation].
- Rotator cuff: positive [right|left|bilateral] [painful arc|Hawkins|Jobe|external rotation lag|belly press].
- Biceps: positive [right|left|bilateral] [bicipital groove tenderness|Speed's|Yergason's].
- AC joint: positive [right|left|bilateral] [tenderness on palpation|cross-body adduction].
- Shoulder: [right|left|bilateral] passive external rotation ___ degrees, limited by [pain|stiffness|both].
```

For suspected adhesive capsulitis, preserve passive restriction and whether pain or stiffness limits movement. Do not assume these findings from the diagnosis. For cervical/shoulder provocation, distinguish local pain from radiating symptoms.

## Normal knee exam

```text
EXAM
- Knee: No effusion, warmth or erythema.
- ROM: Full flexion and extension w/o typical pain.
- Palpation: No joint line, patellar tendon or pes anserine tenderness.
- Stability: No laxity with varus/valgus stress. Lachman and posterior drawer negative.
- Meniscal: McMurray negative.
- Extensor mechanism: Straight leg raise intact.
```

Optional findings:

```text
- Knee: [right|left|bilateral] [effusion|warmth|erythema|crepitus|varus alignment|valgus alignment].
- Palpation: [right|left|bilateral] tenderness over [medial joint line|lateral joint line|patellar facets|patellar tendon|quadriceps tendon|pes anserine|popliteal fossa].
- ROM: [right|left|bilateral] extension ___ degrees, flexion ___ degrees.
- Stability: [right|left|bilateral] laxity with [valgus stress|varus stress|Lachman|posterior drawer].
- Meniscal: positive [right|left|bilateral] [McMurray|Thessaly].
```

Thessaly is optional, particularly with pain, poor balance or limited mobility. Tailor macro use to what was actually examined, especially after arthroplasty.
