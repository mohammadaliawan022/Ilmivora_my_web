# Daily official jobs agent

Ilmivora checks the official PPSC, FPSC, National Jobs Portal, Punjab Job Portal, Khyber Pakhtunkhwa Job Portal, SPSC and NTS listing pages daily at 02:00 Pakistan Standard Time. It imports current public listings into `public.jobs`, keeps their official notice or detail URL, updates existing records by source ID, and hides automatically collected records from the public page if they have not been seen for seven days. Hand-entered listings are not subject to that freshness rule.

The agent sends short excerpts from those official listing pages to Hugging Face Inference Providers, running the open-weight `Qwen/Qwen2.5-7B-Instruct` model, to prepare concise descriptions and extract explicitly stated qualifications. The model is instructed not to invent missing information. The official notice remains the source of truth and every listing links back to it. Hugging Face inference usage may be billable; check the provider's current rates and account limits.

The collector only reads public pages and does not submit applications. NTS projects are filtered to job and recruitment notices; admissions and assessment tests are excluded. Some commissions publish a single advertisement covering several posts, so those appear as one advertisement listing when no individual vacancy records are available on the official page.

## Enable the scheduled agent

1. In Supabase **Edge Function Secrets**, add:
   - `HF_TOKEN`: a Hugging Face user access token with the **Inference Providers** permission. Keep it in Supabase secrets; never add it to website code or GitHub logs.
   - `JOB_SYNC_TOKEN`: a newly generated, long random token used only to trigger this scheduled function.
   - Optionally, `HF_MODEL` if you want to override the default `Qwen/Qwen2.5-7B-Instruct:cheapest`.
2. In the GitHub repository, add these repository Actions secrets under **Settings > Secrets and variables > Actions**:
   - `SUPABASE_URL`: the Ilmivora project's API URL.
   - `SUPABASE_PUBLISHABLE_KEY`: the project's publishable key from **Supabase > Settings > API Keys**.
   - `JOB_SYNC_TOKEN`: the same random token set in Supabase Edge Function Secrets.
3. Deploy the Supabase Edge Function `sync-official-jobs` from `supabase/functions/sync-official-jobs/index.ts`. The included `supabase/config.toml` disables gateway JWT checks for this endpoint; the function itself checks `JOB_SYNC_TOKEN` before it runs.
4. Run **Actions > Daily official Pakistani jobs agent > Run workflow** once. After that, GitHub Actions triggers it daily at 02:00 Pakistan time. You can also run it manually from the Actions tab.
5. Remove the old `SUPABASE_SECRET_KEY` GitHub Actions secret after confirming the new workflow succeeds. The scheduled action no longer needs a database secret key.

The action output reports the result for each portal and the model used. A portal error does not stop imports from the other portals. If a portal changes its page format, its parser needs updating; records remain visible for up to seven days after the last successful source check. A portal batch is not published if model inference fails or does not return a valid summary for every listing in that batch.
