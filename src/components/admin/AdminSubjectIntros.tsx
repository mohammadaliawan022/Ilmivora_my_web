import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Pencil, Save, Trash2, X } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { selectCls } from "@/components/mcq/McqForm";
import { subjectIntroListQuery, subjectIntroQuery } from "@/shared/data/queries";
import {
  INTRO_MAX_CHARS,
  deleteSubjectIntro,
  saveSubjectIntro,
  validateIntroImage,
  validateIntroInput,
  type SubjectIntro,
} from "@/shared/data/subject-intro-repo";
import { SUBJECTS } from "@/shared/subjects";

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read that image."));
    r.readAsDataURL(file);
  });

function labelFor(slug: string): string {
  return SUBJECTS.find((subject) => subject.slug === slug)?.name ?? slug;
}

export function AdminSubjectIntros() {
  const [subjectSlug, setSubjectSlug] = useState(SUBJECTS[0]?.slug ?? "");
  const targetSlug = subjectSlug;
  const saved = useQuery(subjectIntroListQuery());
  const savedSubjects = saved.data?.filter((row) => SUBJECTS.some((subject) => subject.slug === row.slug)) ?? [];

  const pick = (slug: string) => {
    if (SUBJECTS.some((subject) => subject.slug === slug)) setSubjectSlug(slug);
  };

  return (
    <div className="space-y-6">
      <div className="card-surface max-w-3xl space-y-5 p-6 md:p-8">
        <div>
          <h3 className="text-lg font-bold">Subject introduction</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Shown at the top of the subject page, above its MCQs.
          </p>
        </div>
        <div className="max-w-md">
          <div className="space-y-2">
            <Label htmlFor="intro-subject">Subject</Label>
            <select
              id="intro-subject"
              className={selectCls}
              value={subjectSlug}
              onChange={(e) => setSubjectSlug(e.target.value)}
            >
              {SUBJECTS.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <IntroEditor key={targetSlug} slug={targetSlug} />
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-bold">Saved introductions ({savedSubjects.length})</h3>
        {!savedSubjects.length ? (
          <p className="card-surface p-8 text-center text-sm text-muted-foreground">
            No introductions yet. Pick a subject above and add an image or paragraph.
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {savedSubjects.map((row) => (
              <SavedIntroRow key={row.slug} row={row} onEdit={() => pick(row.slug)} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SavedIntroRow({ row, onEdit }: { row: SubjectIntro; onEdit: () => void }) {
  const qc = useQueryClient();
  const remove = useMutation({
    mutationFn: () => deleteSubjectIntro(row.slug),
    onSuccess: () => {
      toast.success("Introduction removed");
      qc.invalidateQueries({ queryKey: ["subject-intros"] });
    },
  });
  return (
    <li className="card-surface flex gap-3 p-3">
      {row.image_url ? (
        <img src={row.image_url} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="grid h-16 w-20 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
          <ImagePlus className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{labelFor(row.slug)}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground">{row.intro ?? "Image only"}</p>
      </div>
      <div className="flex shrink-0 flex-col">
        <Button variant="ghost" size="icon" aria-label={`Edit ${labelFor(row.slug)}`} onClick={onEdit}>
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remove ${labelFor(row.slug)}`}
          onClick={() => remove.mutate()}
          disabled={remove.isPending}
        >
          <Trash2 className="text-danger" />
        </Button>
      </div>
    </li>
  );
}

function IntroEditor({ slug }: { slug: string }) {
  const existing = useQuery(subjectIntroQuery(slug));
  if (existing.isPending) return <p className="text-sm text-muted-foreground">Loading…</p>;
  return <IntroForm slug={slug} initial={existing.data ?? null} />;
}

function IntroForm({ slug, initial }: { slug: string; initial: SubjectIntro | null }) {
  const qc = useQueryClient();
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [imageAlt, setImageAlt] = useState(initial?.image_alt ?? "");
  const [intro, setIntro] = useState(initial?.intro ?? "");
  const [linkDraft, setLinkDraft] = useState("");

  const save = useMutation({
    mutationFn: () => saveSubjectIntro(slug, { image_url: imageUrl || null, image_alt: imageAlt, intro }),
    onSuccess: () => {
      toast.success(`Introduction saved for ${labelFor(slug)}`);
      qc.invalidateQueries({ queryKey: ["subject-intros"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const err = validateIntroImage(file);
    if (err) return void toast.error(err);
    try {
      setImageUrl(await readAsDataUrl(file));
    } catch (er) {
      toast.error((er as Error).message);
    }
  };

  const useLink = () => {
    const url = linkDraft.trim();
    if (!/^https?:\/\/\S+$/i.test(url)) return void toast.error("Enter a full image link starting with https://");
    setImageUrl(url);
    setLinkDraft("");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = validateIntroInput({ image_url: imageUrl || null, image_alt: imageAlt, intro });
    if (err) return void toast.error(err);
    save.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-5 border-t border-border pt-5">
      <div className="space-y-2">
        <Label>Image</Label>
        {imageUrl ? (
          <div className="relative overflow-hidden rounded-xl border border-border">
            <img src={imageUrl} alt={imageAlt || "Subject image preview"} className="h-56 w-full object-cover" />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute right-3 top-3"
              onClick={() => setImageUrl("")}
            >
              <X /> Remove image
            </Button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-8 text-center text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
            <ImagePlus className="h-7 w-7 text-violet" />
            <span className="font-medium text-foreground">Upload an image</span>
            <span>JPG, PNG, WebP or GIF · up to 2 MB</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={onFile} />
          </label>
        )}
        {!imageUrl && (
          <div className="flex gap-2">
            <Input
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              placeholder="…or paste an image link (https://…)"
              aria-label="Image link"
            />
            <Button type="button" variant="outline" onClick={useLink} disabled={!linkDraft.trim()}>
              Use link
            </Button>
          </div>
        )}
      </div>
      {imageUrl && (
        <div className="space-y-2">
          <Label htmlFor="intro-alt">Image description (for screen readers)</Label>
          <Input id="intro-alt" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="e.g. Faisal Mosque, Islamabad" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="intro-text">Introductory paragraph</Label>
        <Textarea
          id="intro-text"
          rows={7}
          value={intro}
          maxLength={INTRO_MAX_CHARS}
          onChange={(e) => setIntro(e.target.value)}
          placeholder="Introduce the subject: what it covers, why it matters in PPSC/FPSC/NTS exams… Leave a blank line to start a new paragraph."
        />
        <p className="text-right text-xs text-muted-foreground">
          {intro.length.toLocaleString()} / {INTRO_MAX_CHARS.toLocaleString()}
        </p>
      </div>
      <Button type="submit" disabled={save.isPending}>
        <Save /> {initial ? "Update introduction" : "Save introduction"}
      </Button>
    </form>
  );
}
