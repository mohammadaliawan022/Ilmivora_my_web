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
  await delay();
  return store.get(slug) ?? null;
}

export async function listSubjectIntros(): Promise<SubjectIntro[]> {
  await delay();
  return [...store.values()].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function saveSubjectIntro(slug: string, input: SubjectIntroInput): Promise<SubjectIntro> {
  await delay();
  const error = validateIntroInput(input);
  if (error) throw new Error(error);
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
  await delay();
  store.delete(slug);
}
