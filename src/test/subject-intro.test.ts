import { describe, expect, it } from "vitest";
import {
  getSubjectIntro,
  saveSubjectIntro,
  validateIntroImage,
  validateIntroInput,
} from "@/lib/data/subject-intro-repo";

describe("subject introductions", () => {
  it("accepts images up to 2 MB and rejects larger ones", () => {
    expect(validateIntroImage({ type: "image/png", size: 2 * 1024 * 1024 })).toBeNull();
    expect(validateIntroImage({ type: "image/png", size: 2 * 1024 * 1024 + 1 })).not.toBeNull();
  });

  it("rejects files that are not images", () => {
    expect(validateIntroImage({ type: "application/pdf", size: 1000 })).not.toBeNull();
  });

  it("needs an image or a paragraph", () => {
    expect(validateIntroInput({ image_url: null, image_alt: null, intro: "   " })).not.toBeNull();
    expect(validateIntroInput({ image_url: null, image_alt: null, intro: "Physics is…" })).toBeNull();
  });

  it("saves and reads back an intro for a subject page", async () => {
    await saveSubjectIntro("physics", { image_url: "https://example.com/p.jpg", image_alt: "Lab", intro: "  Intro  " });
    const row = await getSubjectIntro("physics");
    expect(row?.intro).toBe("Intro");
    expect(row?.image_url).toBe("https://example.com/p.jpg");
  });
});
