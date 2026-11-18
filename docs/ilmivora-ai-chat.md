# Ask Ilmivora

The `/ask` page lets signed-in students ask questions about Ilmivora's published MCQs and subject introductions. The server searches only public MCQs (`is_hidden = false`), gives the closest matches to the model, streams its response, and links to the source questions.

## Hugging Face model setup

The chat uses Hugging Face Inference Providers and defaults to `Qwen/Qwen3-4B-Instruct-2507:cheapest`, an Apache 2.0 open-weight model. Hugging Face routes inference to a provider, so this does not require a GPU server. Provider availability and charges depend on the selected model and provider.

1. Create a Hugging Face user access token with **Inference Providers** permission in [Hugging Face token settings](https://huggingface.co/settings/tokens).
2. For local development, place it in `.env.local` as `HF_TOKEN=...`.
3. In Vercel, open **Project Settings > Environment Variables** and add `HF_TOKEN` for Production and Preview.
4. Redeploy after adding the production variable.

Keep the token server-side. Do not prefix it with `VITE_`, commit it, or put it in GitHub Actions unless a separate workflow needs it. A token stored in GitHub Actions is not automatically available to Vercel.

Set the optional server-only `HF_MODEL` variable to change the model ID. Hugging Face's monthly credits and pay-as-you-go pricing can change; check the [Inference Providers pricing](https://huggingface.co/docs/inference-providers/pricing) before enabling this for students.

Users must be signed in. The API limits each user to 20 requests per hour per running server instance.
