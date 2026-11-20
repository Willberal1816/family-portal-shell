# Moran School Student-Page Standard

- Identify the student and lesson automatically. Do not ask the student to rewrite Name or Date for administrative purposes.
- Print the authoritative Tracking #, student, class date, and class title on every student-work page so scanner output can be matched back to the Assignment ID.
- Keep printables paper-first, uncluttered, and sized for US Letter printing.
- Learn First pages must teach the idea in child-readable language before asking for independent work. Explain the concrete idea first, then introduce and define formal vocabulary.
- Every skill/reasoning lesson must include a fully explained worked example, demonstration, model, or concrete case before independent work.
- Do not expose planner/backend wording such as prerequisite, reteaches, class plan, advancement, or evidence-gathering language to the student.
- Worksheet directions must say exactly what the student must produce and how much. Do not use Explain, Compare, Interpret, Justify, Estimate, or Show your thinking as a vague standalone instruction.
- Any visual aid must do instructional work: label it, include the marks/shading/arrows/data the explanation depends on, and place it with the question or explanation that uses it. Blank or decorative graphs, number lines, fraction models, maps, tables, or diagrams are not acceptable teaching aids.
- Provide scaffolds such as grids, number lines, tables, charts, fraction models, or diagrams when using the structure is the skill. Require the student to construct the structure only when construction itself is the learning objective.
- Mathematical fractions in every subject must use the shared stacked-fraction markup and shared stylesheet: numerator above denominator, horizontal bar, center-aligned inline with surrounding text/operators. Do not display slash fractions such as 3/4 to students.
- Mixed numbers must keep the whole number and stacked fraction together visually.
- Preserve enough working space to show reasoning, not just final answers.
- Learn First and the matching printable must be reviewed as one class before publication: teaching must prepare the student for the exact vocabulary, reasoning, visuals, and task directions used on the printable.
## Printing for both girls (current standard)

- Emma and Natalie use the same print architecture. The School Portal opens a same-site HTML lesson/worksheet page; the separate native PDF asset is the printing document when the portal runs as an installed iPad Home Screen app. This is one common policy, regardless of which student's iPadOS has been updated.
- Every printable lesson must have an actual, valid PDF at `worksheets/curriculum/print-pdf/<lesson-stem>.pdf`, included in the lesson-to-PDF mapping in `worksheets/school-ipados27-print.js`. Load that shared script on the School Portal and each applicable lesson page. The printed PDF must match the student-specific questions and show student, lesson date, title, and the authoritative Tracking # on every page.
- In the iPad Home Screen/standalone app, `printWorksheet()` calls `schoolNativePrint()`. It prepares the PDF and invokes the iPad's native Share sheet. If the first tap prepares the file, tap **Print Worksheet** again when ready and choose **Print** in the Share sheet. Do not use `window.print()` as the intended standalone iPad method; that was the printing failure after Emma updated iPadOS.
- Ordinary/non-standalone browsers may use the existing browser-print fallback. Do not confuse that fallback with the required PDF Share-sheet path for either student's installed iPad app, and do not replace the student entry page with Google Drive, Docs, an external PDF viewer, or a special student-specific Open PDF button.
- Before publishing, verify both HTML lesson visibility and the actual PDF's existence, page count, print layout, all assigned questions, handwriting space, repeated student/date/Tracking # headers, and deployed mapping. Physical Share-sheet opening and real printing remain **UNVERIFIED** on each iPad until checked on that device; do not claim device success from file generation or code inspection alone. Report an unavailable PDF or Share-sheet error as a blocker rather than silently substituting HTML printing.
