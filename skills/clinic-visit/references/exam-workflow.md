# Assistant-operated examination assembly

Use the current preferences and `physical-exam.md` for clinical wording. The editable `exam-builder.html` owns the lumbar, cervical and shoulder **review scaffolds**, plus the exact user-supplied `examCspinemotor`, `examShouldercuff` and `examLBPdeepglut` definitions. Repository scripts are bundled under the skill's `scripts/`, HTML under `assets/`.

## Workflow

1. Read the supplied encounter and clinician corrections. Identify the current examination separately from historical/referral findings. Select the relevant region; never transfer a previous examination into the current section without current support.
2. The assistant prepares the state and source receipts. Populate supported findings as literal complete lines. Clinician normal shorthand invokes only the approved component or regional macro in `physical-exam.md`, with exceptions preserved. The larger selectable scaffold does not expand the scope of a normal macro. For example, motor normal does not establish heel/toe walking, or untested shoulder instability/labral manoeuvres.
3. Missing findings remain review choices, never preselected normal. Populate a partial line using a literal override containing supported text and the remaining native choices. Omit rows only when authorized or clinically outside the selected examination scope, with source evidence explaining the omission. Do not ask Victoria to fill a separate input form or re-enter the transcript.
4. `null` is deletion: selecting it removes the entire containing selection, including its nested choices. Unselected is distinct from null. Never print null, “not examined”, a normal result, or a dangling label to represent deletion. Optional punctuation belongs inside the optional selection.
5. Known detailed macros expand when selected; the three definitions are preserved verbatim in the HTML. Fixed language such as **Contralateral 5/5** still requires support. For bilateral abnormalities, an untested opposite side, grades outside the offered choices, or pain-limited testing, use the actual source-backed wording rather than force the macro. Other `exam...` definitions are not supplied: retain the unresolved token in review or enter documented findings; never invent an expansion.
6. Square selections support one or explicitly several options where side + finding need combining. Curly brace semantics remain unspecified. Preserve `{...}` unchanged for the user's native editor; do not assume single/multiple selection. In the HTML, these can be replaced with actual documented findings using the line editor. Do not pretend every native-editor interaction has been replicated.
7. Run the source-backed CLI in review mode. Return the normal full chart with the generated EXAM review text; keep all other sections unchanged unless the task independently requires their update. Optionally produce an already-populated HTML artifact via `--review-html`; it is an alternative review surface, not a required extra task for Victoria.
8. Final mode withholds incomplete selections, unknown macros, blank measurements, invalid syntax and unconfirmed nonempty rows. A whole row must be supported or confirmed, including its fixed words. The HTML confirms rows through an explicit checkbox; CLI-populated findings require quoted source evidence. Exporting review text with choices is intentional and is not a final-exam claim.
9. If updating an existing chart, use final mode and explicit `--chart`/`--chart-output`. Replacement targets exactly one named examination header and preserves surrounding chart bytes. Ambiguous boundaries fail rather than guessing. Continue the existing exam-only verifier when a completed note is delivered; this renderer is not an independent clinical reader.

## Source-backed CLI

```sh
node scripts/render_exam.cjs --input /tmp/encounter/exam.json --output /tmp/encounter/exam-review.txt --mode review --review-html /tmp/encounter/exam-review.html
node scripts/render_exam.cjs --input /tmp/encounter/exam-complete.json --output /tmp/encounter/exam-final.txt --mode final --chart /tmp/encounter/chart.txt --chart-output /tmp/encounter/updated-chart.txt
```

Packet structure (synthetic illustration):

```json
{
  "state": {
    "region": "lumbar",
    "header": "EXAM",
    "rows": {
      "motor": {"status": "supported", "text": "- Motor: L2–S1 5/5 B/L."}
    }
  },
  "sources": [{"id": "current", "path": "dictation.txt", "sha256": "ACTUAL_FILE_SHA256", "role": "current"}],
  "evidence": [{"rowId": "motor", "sourceId": "current", "quote": "Motor normal bilaterally."}]
}
```

This is a schema example, not a runnable receipt. Supply real file hashes and exact source quotes. Roles are `current`, `historical`, or `instruction`. Historical evidence cannot populate current `EXAM`; label prior examinations explicitly. Every changed row (including explicit omission, template override, selections, support or confirmation) needs evidence. Default untouched review rows need none.

Row status is `review`, `supported`, or `omitted`. Optional fields are `text`, `selections`, and `confirmed`. `selections` maps stable IDs returned by `ExamEngine.renderLine(...).controls` to option indices or explicit arrays. No answer uses an absent key; `null` deletion uses the index of the literal null option. State is patient-specific; keep it and all outputs outside the repository/plugin.

The source checker validates hashes, exact quotes and declared provenance, not whether a quote truly supports the whole clinical statement. The assistant must perform that review. The HTML has no network calls or automatic browser persistence. An explicitly saved review HTML/JSON contains clinical text and must be handled as a patient document. It does not send chart content or modify the EMR. Local bundle updates are not cloud-plugin publication.
