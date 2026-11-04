<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- All MCQ reads/writes go through `src/lib/data/mcq-repo.ts` (async, paginated); UI never touches the data source directly so the preview store can be swapped for the existing `public.mcqs` table without UI changes.
- MCQ shape mirrors the existing `public.mcqs` columns (`option_a..d`, `correct_answer`, `subject`, `exam_category`, nullable `topic`); normalise answers with `getCorrectLetter` because stored answers may be letters or option text.
- Quiz/exam rules (timer length, scoring) live in `src/lib/mcq.ts` and are covered by `src/test/mcq-rules.test.ts`.
- The subject/section tree is owner data in `src/lib/category-data.ts` (generated from their CSV; never hand-invent entries) and is read through `src/lib/categories.ts`; top-level names map to the MCQ `subject` column, nested names to `topic`, and a section's MCQ list includes its nested sections (`getTopicScope`).
- Student MCQ submissions live separately from live MCQs and only become MCQs through admin approval in `mcq-repo.ts`, so unreviewed content never reaches students.
- Subject/section intros (image + paragraph) are keyed by category slug and go through `src/lib/data/subject-intro-repo.ts`, so they can move to a table + file storage without UI changes.
- Admin sections are selected via the `?tab=` URL param on `/admin` so each section is linkable and survives reload.
- Theme uses a `.dark` class on `<html>` set by an inline head script before paint to avoid flashes.
