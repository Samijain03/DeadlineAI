# DeadlineAI redesign

Figma file: https://www.figma.com/design/DlDAqIml9a1KYwqOALoeHC

## Completed in Figma

- Student journey and recovery paths.
- Design direction and motion guidance.
- 46 scoped design variables; 7 DM Sans text styles.
- 11 reusable button, field, and task-card variants.
- Three-page structure: guide/components, desktop, mobile.
- Six desktop prototype screens on `02 · Desktop prototype`:
  - Today (`11:2`)
  - Add notice (`11:83`)
  - Processing (`11:136`)
  - Review details (`11:179`)
  - Saved confirmation (`11:250`)
  - Task detail (`11:292`)

## Interactive local preview

The isolated React preview is available at http://127.0.0.1:5174/redesign.html while the local server is running. It includes Today, notices and search, calendar, reminders, upload, editable review, save confirmation, task completion with Undo, recovery scenarios, and an animated product introduction. Layouts adapt to desktop and mobile, with expandable source documents on smaller screens and reduced-motion support.

From `frontend`, run `node node_modules/vite/bin/vite.js --config vite.redesign.config.js --host 127.0.0.1 --port 5174` and open `/redesign.html`. Build with `node node_modules/vite/bin/vite.js build --config vite.redesign.config.js`; output goes to `dist-redesign` independently of the existing application build.

The preview uses sample data dated 24 September 2026. Changes last only until refresh. A sample notice demonstrates extraction; personal files open manual entry. No files are uploaded, no AI extraction runs, and no reminders are sent. DM Sans loads from Google Fonts, with system fallbacks.

Use **Preview states** at the bottom of the workspace to test empty data, missing dates, unreadable uploads, and a failed save followed by retry. Select **Meet DeadlineAI** to see the animated product introduction.

## Frontend integration

The redesign is now the default Vite application at `http://127.0.0.1:5173/`. It reads and writes through the existing `noticeService`, uses the Django document-parsing endpoint for personal PDF/JPG/PNG uploads, falls back to a clear manual-entry recovery when the API is unavailable, and derives Today and the seven-day outlook from the current date. The earlier frontend remains available at `/?legacy=1` for comparison while migration continues.

The standalone `/redesign.html` entry remains a fixed sample prototype for design review. It should not be used as the production entry.

## Figma transfer status

The prepared desktop composition in `figma-desktop-pending.js` was executed successfully on 25 September 2026. The Starter-plan MCP limit was reached immediately afterward, so the new frames could not be screenshot-validated in the same pass. Do not execute the composition again: it has an `alreadyExists` guard, but the existing frames above are the source of truth.

Next Figma pass: visually validate the six desktop frames, correct any layout issues, add mobile Today / Add / Review / Task screens on `03 · Mobile prototype`, create the missing-date, upload-error, save-error, empty, completed, and updated-Today states, then apply the recorded prototype links. The local preview remains the interaction reference. The preview has its own entry point and stylesheet; existing application source files have not been changed by this redesign work.

## Agreed direction

Warm off-white, charcoal, restrained amber, and sage. Student-facing language. Primary navigation: Today, Notices, Calendar, Reminders; separate administration. Preserve human review before save. Do not invent dates, confidence values, eligibility, or successful reminder delivery.

## Prototype scope

Desktop and mobile: Today, Add notice, Processing, Review, Missing date, Save confirmation, Task detail, Completed with Undo, Upload error, Save error, Empty state. The guide maps welcome and sign-in; those screens and secondary navigation are for a later pass. Sample data must be clearly identified.

## Motion

Controls: 180 ms; screen changes: 240 ms; success reveal: 400 ms. Reduced-motion mode should use immediate transitions. A future landing-page concept transforms a notice into an action card and a calendar entry. Motion must not delay routine use.
