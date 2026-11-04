/**
 * Subject/section introductions (cover image + intro paragraph), keyed by the
 * category slug. Reads/writes are async so the preview store can be swapped
 * for a database table + file storage without UI changes.
 */

export interface SubjectIntro {
  slug: string;
  image_url: string | null;
  image_alt: string | null;
  intro: string | null;
  updated_at: string;
}

export type SubjectIntroInput = Omit<SubjectIntro, "slug" | "updated_at">;
import { deleteSubjectIntroImage, isPreviewMode, supabaseRest, uploadSubjectIntroImage } from "../supabase";

export const INTRO_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const INTRO_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const INTRO_MAX_CHARS = 3000;

/** Returns an error message, or null when the image file is acceptable. */
export function validateIntroImage(file: { type: string; size: number }): string | null {
  if (!INTRO_IMAGE_TYPES.includes(file.type)) return "Use a JPG, PNG, WebP or GIF image.";
  if (file.size > INTRO_IMAGE_MAX_BYTES) return "Image must be 2 MB or smaller.";
  return null;
}

/** Returns an error message, or null when the intro can be saved. */
export function validateIntroInput(input: SubjectIntroInput): string | null {
  const intro = input.intro?.trim() ?? "";
  if (!intro && !input.image_url) return "Add an image or an introductory paragraph.";
  if (intro.length > INTRO_MAX_CHARS) return `Keep the introduction under ${INTRO_MAX_CHARS} characters.`;
  return null;
}

const store = new Map<string, SubjectIntro>();
const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));

export async function getSubjectIntro(slug: string): Promise<SubjectIntro | null> {
  if (!isPreviewMode) {
    const query = new URLSearchParams({ select: "*", slug: `eq.${slug}`, limit: "1" });
    const { data } = await supabaseRest<SubjectIntro[]>(`subject_intros?${query}`);
    return data[0] ?? null;
  }
  await delay();
  return store.get(slug) ?? null;
}

export async function listSubjectIntros(): Promise<SubjectIntro[]> {
  if (!isPreviewMode) {
    const query = new URLSearchParams({ select: "*", order: "updated_at.desc" });
    const { data } = await supabaseRest<SubjectIntro[]>(`subject_intros?${query}`);
    return data;
  }
  await delay();
  return [...store.values()].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function saveSubjectIntro(slug: string, input: SubjectIntroInput): Promise<SubjectIntro> {
  const error = validateIntroInput(input);
  if (error) throw new Error(error);
  if (!isPreviewMode) {
    const existing = await getSubjectIntro(slug);
    let imageUrl = input.image_url || null;
    if (imageUrl?.startsWith("data:")) {
      const image = await fetch(imageUrl);
      const blob = await image.blob();
      imageUrl = await uploadSubjectIntroImage(slug, blob, blob.type);
    }
    const query = new URLSearchParams({ on_conflict: "slug", select: "*" });
    const { data } = await supabaseRest<SubjectIntro[]>(`subject_intros?${query}`, {
      method: "POST",
      body: {
        slug,
        image_url: imageUrl,
        image_alt: input.image_alt?.trim() || null,
        intro: input.intro?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      prefer: "resolution=merge-duplicates,return=representation",
    });
    if (!data[0]) throw new Error("The subject introduction was not saved.");
    if (existing?.image_url && existing.image_url !== imageUrl && existing.image_url.includes("/storage/v1/object/public/subject-intros/")) {
      await deleteSubjectIntroImage(existing.image_url);
    }
    return data[0];
  }
  await delay();
  const row: SubjectIntro = {
    slug,
    image_url: input.image_url || null,
    image_alt: input.image_alt?.trim() || null,
    intro: input.intro?.trim() || null,
    updated_at: new Date().toISOString(),
  };
  store.set(slug, row);
  return row;
}

export async function deleteSubjectIntro(slug: string): Promise<void> {
  if (!isPreviewMode) {
    const existing = await getSubjectIntro(slug);
    const query = new URLSearchParams({ slug: `eq.${slug}` });
    await supabaseRest(`subject_intros?${query}`, { method: "DELETE", prefer: "return=minimal" });
    if (existing?.image_url?.includes("/storage/v1/object/public/subject-intros/")) {
      await deleteSubjectIntroImage(existing.image_url);
    }
    return;
  }
  await delay();
  store.delete(slug);
}
