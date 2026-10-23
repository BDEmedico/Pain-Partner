# Agreed physical examination macros

## Assembly rules

- Extract examination findings from the entire encounter dictation, including findings spoken during the impression and plan. Assemble them under EXAM.
- Expand a normal macro only when Victoria explicitly invokes it for the current encounter. This shorthand represents her report of the agreed examination, not a default examination performed on every patient.
- Specific findings override the corresponding normal finding. Preserve other invoked normal findings. Example: "normal back exam, Fortin positive" retains the back macro but replaces its SIJ line with `- SIJ: Fortin positive [right|left|bilateral], cluster negative.` Pain across the back belongs in the history, unless specifically an examination finding.
- Include hip and GT components whenever the normal back macro is invoked. In a back-examination scaffold include these headings, but do not fabricate results if no macro or findings were supplied.
- If the impression lacks relevant examination support, insert a focused selectable prompt for findings Victoria may have omitted. Do not infer that a positive finding occurred from the diagnosis. Unresolved prompts are not completed clinical findings and must be selected, amended or removed before signing.
- Use the exact compact multi-select syntax below. Several maneuvers may be selected. Selection/highlighting depends on the destination editor and is not guaranteed by plain chat text. These approved prompts override older universal null-first syntax for examination prompts.
- Keep the normal SIJ line short. Do not expand or invent the maneuvers underlying "cluster negative" and do not repeatedly request a definition.
- Positive provocation findings should reflect the patient's typical pain where applicable. Preserve distinctions between pain, weakness, restriction and radiating symptoms.
- Use `EXAM virtual follow up` for phone/virtual follow-ups. Preserve historical findings under `Previous EXAM`, with source/date where known. Do not label an in-person follow-up virtual or carry previous findings forward as current.
- Check the whole note for clinical consistency. A normal macro does not establish a diagnosis. Keep material questions outside the copyable note, with focused prompts where helpful.

## Output consistency

For explicitly supplied normal lower limb findings or invoked shorthand, always use the motor and sensory lines below. Victoria's explicit corrections override the transcript, and specific abnormalities override only their corresponding normal findings. Do not expand partial testing to untested roots or assume missing findings are normal. Check motor, sensation and reflexes before delivery. Place unresolved examination questions below the note unless a focused square-bracket choice is needed in the draft.

## Normal back exam

```text
EXAM
- Motor: L2–S1 5/5 bilaterally. Heel and toe walking intact.
- Sensation: Intact and symmetrical to light touch in L2–S1 dermatomes.
- Reflexes: Patellar and Achilles 2+ bilaterally.
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
