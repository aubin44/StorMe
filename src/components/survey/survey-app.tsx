import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  FileDown,
  ImagePlus,
  LocateFixed,
  Mountain,
  Plus,
  Snowflake,
  Trash2,
  UnfoldVertical,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { Mark } from "@/components/survey/logo";
import { useI18n, type Dict, type Lang } from "@/lib/i18n";
import { FieldMap } from "@/components/survey/field-map";
import { communeFromLv95 } from "@/lib/releve/commune";
import { groupDigits, inSwitzerland, lv95ToWgs, parseCoord, wgsToLv95 } from "@/lib/releve/coords";
import { deleteReleve, listReleves, rememberRapporteur, rememberedRapporteur, saveReleve } from "@/lib/releve/db";
import { renderTopoPng } from "@/lib/releve/map-snapshot";
import { buildRelevePdf, savePdfFile } from "@/lib/releve/pdf";
import { fileToPhoto } from "@/lib/releve/photos";
import {
  IMPORTANCE,
  MESURES,
  PROCESSUS,
  blankReleve,
  processusById,
  type MesuresId,
  type Photo,
  type ProcessusId,
  type Releve,
} from "@/lib/releve/types";

const STEP_COUNT = 8;

const ICONS: Record<ProcessusId, LucideIcon> = {
  chute: Mountain,
  effondrement: UnfoldVertical,
  glissement: ArrowDownRight,
  avalanche: Snowflake,
  crue: Waves,
};

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-3 text-base text-ink outline-none focus-visible:border-pine";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink">{label}</span>
      {hint ? <span className="mt-1 block text-sm leading-snug text-muted">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function choiceClass(active: boolean) {
  return active
    ? "border-pine bg-pine text-bg"
    : "border-line bg-surface text-ink hover:border-pine";
}

export function SurveyApp() {
  const [records, setRecords] = useState<Releve[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [editing, setEditing] = useState<Releve | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    listReleves()
      .then(setRecords)
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  async function openNew() {
    const draft = blankReleve(rememberedRapporteur());
    await saveReleve(draft);
    setRecords((current) => [draft, ...(current ?? [])]);
    setEditing(draft);
  }

  if (loadError) {
    return (
      <Shell>
        <p className="text-base text-ink">{t("loadError")}</p>
      </Shell>
    );
  }

  if (!records) {
    return (
      <Shell>
        <p className="text-base text-muted">{t("loading")}</p>
      </Shell>
    );
  }

  if (editing) {
    return (
      <Wizard
        initial={editing}
        onClose={(latest) => {
          setRecords((current) => replaceRecord(current ?? [], latest));
          setEditing(null);
        }}
        onSaved={(latest) => setRecords((current) => replaceRecord(current ?? [], latest))}
        onDelete={async (id) => {
          await deleteReleve(id);
          setRecords((current) => (current ?? []).filter((item) => item.id !== id));
          setEditing(null);
        }}
      />
    );
  }

  return <Home records={records} onNew={openNew} onOpen={setEditing} onDelete={async (id) => {
    await deleteReleve(id);
    setRecords((current) => (current ?? []).filter((item) => item.id !== id));
  }} />;
}

function replaceRecord(records: Releve[], next: Releve): Releve[] {
  const rest = records.filter((item) => item.id !== next.id);
  return [next, ...rest].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t("langLabel")} className={`flex overflow-hidden rounded-lg border border-bg/40 text-xs font-semibold ${className}`}>
      {(["fr", "de"] as Lang[]).map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className={`px-2.5 py-2 uppercase ${lang === code ? "bg-bg text-pine" : "text-bg"}`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="bg-pine pt-safe text-bg">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-4">
          <Mark className="h-10 w-10 text-bg" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl leading-none">Aléa</p>
            <p className="mt-1 text-sm text-bg/80">{t("appTagline")}</p>
          </div>
          <LangSwitch />
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 py-6">{children}</main>
    </div>
  );
}

function Home({
  records,
  onNew,
  onOpen,
  onDelete,
}: {
  records: Releve[];
  onNew: () => void;
  onOpen: (releve: Releve) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useI18n();
  return (
    <Shell>
      <button
        type="button"
        onClick={onNew}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber px-4 py-4 text-base font-semibold text-bg"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
        {t("newReleve")}
      </button>
      <InstallHint />
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {t("homeIntro")}
      </p>

      {records.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-surface px-4 py-8 text-center">
          <p className="font-display text-xl text-ink">{t("emptyTitle")}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {t("emptyBody")}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {records.map((releve) => (
            <li key={releve.id}>
              <RecordCard releve={releve} onOpen={() => onOpen(releve)} onDelete={() => onDelete(releve.id)} />
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

function RecordCard({
  releve,
  onOpen,
  onDelete,
}: {
  releve: Releve;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const { t, d } = useI18n();
  const option = processusById(releve.processus);
  const Icon = option ? ICONS[option.id] : Mountain;
  return (
    <article className="rounded-xl border border-line bg-surface">
      <button type="button" onClick={onOpen} className="flex w-full items-start gap-3 px-4 py-4 text-left">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pine text-bg">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-ink">{option ? t(`processus.${option.id}.label` as keyof Dict) : t("releveStarted")}</span>
          <span className="mt-1 block text-sm text-muted">
            {[releve.commune || t("communeToSpecify"), formatListDate(releve.date) ?? t("datePending")].join(" · ")}
          </span>
          <span className="mt-1 block text-sm text-ink">
            {releve.x && releve.y
              ? `X ${groupDigits(releve.x)}  ·  Y ${groupDigits(releve.y)}`
              : t("positionNotSet")}
            {releve.photos.length > 0 ? `  ·  ${d.photoCount(releve.photos.length)}` : ""}
          </span>
        </span>
      </button>
      <div className="flex justify-end border-t border-line px-3 py-2">
        {confirm ? (
          <div className="flex items-center gap-2">
            <button type="button" className="px-3 py-2 text-sm text-muted" onClick={() => setConfirm(false)}>
              {t("cancel")}
            </button>
            <button type="button" className="rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-bg" onClick={onDelete}>
              {t("delete")}
            </button>
          </div>
        ) : (
          <button type="button" className="inline-flex items-center gap-1 px-3 py-2 text-sm text-muted" onClick={() => setConfirm(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t("delete")}
          </button>
        )}
      </div>
    </article>
  );
}

function formatListDate(iso: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return `${match[3]}.${match[2]}.${match[1]}`;
}

function InstallHint() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);
  const { t } = useI18n();
  const standalone = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(display-mode: standalone)").matches;
  }, []);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden || standalone) return null;

  return (
    <div className="mb-4 rounded-xl border border-line bg-surface px-4 py-3">
      <p className="text-sm font-semibold text-ink">{t("installTitle")}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        {t("installBody")}
      </p>
      <div className="mt-3 flex gap-2">
        {installEvent ? (
          <button
            type="button"
            className="rounded-lg bg-pine px-3 py-2 text-sm font-semibold text-bg"
            onClick={async () => {
              await installEvent.prompt();
              setInstallEvent(null);
              setHidden(true);
            }}
          >
            {t("install")}
          </button>
        ) : null}
        <button type="button" className="px-3 py-2 text-sm text-muted" onClick={() => setHidden(true)}>
          {t("later")}
        </button>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

function Wizard({
  initial,
  onClose,
  onSaved,
  onDelete,
}: {
  initial: Releve;
  onClose: (latest: Releve) => void;
  onSaved: (latest: Releve) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [step, setStep] = useState(0);
  const { t, d, lang } = useI18n();
  const [gpsError, setGpsError] = useState<keyof Dict | null>(null);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [communeBusy, setCommuneBusy] = useState(false);
  const [communeNote, setCommuneNote] = useState<keyof Dict | null>(null);
  const [photoError, setPhotoError] = useState<keyof Dict | null>(null);
  const [exportState, setExportState] = useState<"idle" | "map" | "pdf" | "done" | "error">("idle");
  const [exportError, setExportError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const latest = useRef(draft);
  latest.current = draft;

  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = { ...latest.current, updatedAt: new Date().toISOString() };
      rememberRapporteur(next.rapporteur);
      saveReleve(next)
        .then(() => onSavedRef.current(next))
        .catch(() => {});
    }, 400);
    return () => window.clearTimeout(timer);
  }, [draft]);

  function patch(partial: Partial<Releve>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function setPosition(lat: number, lng: number) {
    const { e, n } = wgsToLv95(lat, lng);
    setGpsError(null);
    setDraft((current) => ({
      ...current,
      lat,
      lng,
      x: String(Math.round(e)),
      y: String(Math.round(n)),
    }));
  }

  function setManualCoord(axis: "x" | "y", raw: string) {
    setDraft((current) => {
      const next = { ...current, [axis]: raw.replace(/[^\d]/g, "") };
      const e = parseCoord(next.x);
      const n = parseCoord(next.y);
      if (e != null && n != null && e > 2_400_000 && n > 1_000_000) {
        const wgs = lv95ToWgs(e, n);
        next.lat = wgs.lat;
        next.lng = wgs.lng;
      }
      return next;
    });
  }

  async function locate() {
    if (!navigator.geolocation) {
      setGpsError("gpsUnsupported");
      return;
    }
    setGpsBusy(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition(position.coords.latitude, position.coords.longitude);
        setGpsBusy(false);
      },
      () => {
        setGpsBusy(false);
        setGpsError("gpsDenied");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  async function identifyCommune() {
    const e = parseCoord(draft.x);
    const n = parseCoord(draft.y);
    if (e == null || n == null) {
      setCommuneNote("placeFirst");
      return;
    }
    setCommuneBusy(true);
    setCommuneNote(null);
    try {
      const name = await communeFromLv95(e, n);
      if (!name) setCommuneNote("communeNotFound");
      else patch({ commune: name });
    } catch {
      setCommuneNote("networkDown");
    } finally {
      setCommuneBusy(false);
    }
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setPhotoError(null);
    const room = 12 - draft.photos.length;
    if (room <= 0) {
      setPhotoError("photoMax");
      return;
    }
    const next: Photo[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      try {
        next.push(await fileToPhoto(file));
      } catch {
        setPhotoError("photoUnreadable");
      }
    }
    if (next.length) patch({ photos: [...draft.photos, ...next] });
  }

  const missing = missingBits(draft, d);
  const east = parseCoord(draft.x);
  const north = parseCoord(draft.y);
  const outside = east != null && north != null && !inSwitzerland(east, north);

  async function exportPdf() {
    if (missing.length) return;
    setExportState("map");
    setExportError(null);
    try {
      const map = draft.lat != null && draft.lng != null ? await renderTopoPng(draft.lat, draft.lng) : null;
      setExportState("pdf");
      const { bytes, filename } = await buildRelevePdf(draft, map, lang);
      savePdfFile(bytes, filename);
      const saved = { ...draft, updatedAt: new Date().toISOString() };
      await saveReleve(saved);
      onSaved(saved);
      setExportState("done");
    } catch (error) {
      setExportState("error");
      setExportError(error instanceof Error ? error.message : t("exportFailed"));
    }
  }

  const stepKey = (part: "title" | "kicker", index = step) => t(`step.${index}.${part}` as keyof Dict);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-20 bg-pine pt-safe text-bg">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-3 py-3">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-bg"
            onClick={() => onClose({ ...latest.current, updatedAt: new Date().toISOString() })}
            aria-label={t("back")}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wide text-bg/70">
              {step + 1} / {STEP_COUNT} · {stepKey("kicker")}
            </p>
            <h1 className="truncate font-display text-2xl leading-tight">{stepKey("title")}</h1>
          </div>
          <LangSwitch />
        </div>
        <div className="mx-auto flex max-w-xl gap-1 px-4 pb-3">
          {Array.from({ length: STEP_COUNT }, (_, index) => (
            <button
              key={index}
              type="button"
              aria-label={stepKey("title", index)}
              onClick={() => setStep(index)}
              className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-amber" : "bg-bg/30"}`}
            />
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-5 px-4 py-5 pb-28">
        {step === 0 ? <StepProcess value={draft.processus} onChange={(processus) => patch({ processus })} /> : null}
        {step === 1 ? (
          <StepPlace
            draft={draft}
            outside={outside}
            gpsBusy={gpsBusy}
            gpsError={gpsError}
            communeBusy={communeBusy}
            communeNote={communeNote}
            onLocate={locate}
            onCommune={identifyCommune}
            onPick={setPosition}
            onCoord={setManualCoord}
            onCommuneText={(commune) => patch({ commune })}
          />
        ) : null}
        {step === 2 ? (
          <div className="space-y-5">
            <Field label={t("date")} hint={t("dateHint")}>
              <input className={inputClass} type="date" value={draft.date} onChange={(event) => patch({ date: event.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("time")}>
                <input className={inputClass} type="time" value={draft.heure} onChange={(event) => patch({ heure: event.target.value })} />
              </Field>
              <Field label={t("duration")} hint={t("durationHint")}>
                <input className={inputClass} value={draft.duree} onChange={(event) => patch({ duree: event.target.value })} />
              </Field>
            </div>
          </div>
        ) : null}
        {step === 3 ? (
          <Field label={t("descLabel")} hint={t("descHint")}>
            <textarea className={`${inputClass} min-h-48`} value={draft.description} onChange={(event) => patch({ description: event.target.value })} />
          </Field>
        ) : null}
        {step === 4 ? (
          <div className="space-y-5">
            <Field label={t("causesLabel")} hint={t("causesHint")}>
              <textarea className={`${inputClass} min-h-36`} value={draft.causes} onChange={(event) => patch({ causes: event.target.value })} />
            </Field>
            <Field label={t("damageLabel")} hint={t("damageHint")}>
              <textarea className={`${inputClass} min-h-36`} value={draft.degats} onChange={(event) => patch({ degats: event.target.value })} />
            </Field>
          </div>
        ) : null}
        {step === 5 ? (
          <div className="space-y-5">
            <Field label={t("risksLabel")} hint={t("risksHint")}>
              <textarea className={`${inputClass} min-h-40`} value={draft.risques} onChange={(event) => patch({ risques: event.target.value })} />
            </Field>
            <fieldset>
              <legend className="text-sm font-semibold text-ink">{t("importanceLabel")}</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {IMPORTANCE.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={draft.importance === item.id}
                    className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold ${choiceClass(draft.importance === item.id)}`}
                    onClick={() => patch({ importance: draft.importance === item.id ? "" : item.id })}
                  >
                    {t(`importance.${item.id}` as keyof Dict)}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}
        {step === 6 ? (
          <div className="space-y-5">
            <fieldset>
              <legend className="text-sm font-semibold text-ink">{t("measuresLabel")}</legend>
              <div className="mt-2 space-y-2">
                {MESURES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={draft.mesures === item.id}
                    className={`w-full rounded-xl border px-3 py-3 text-left text-sm font-semibold ${choiceClass(draft.mesures === item.id)}`}
                    onClick={() => patch({ mesures: draft.mesures === item.id ? "" : (item.id as MesuresId) })}
                  >
                    {t(`mesures.${item.id}` as keyof Dict)}
                  </button>
                ))}
              </div>
            </fieldset>
            <Field label={t("organizedBy")}>
              <input className={inputClass} value={draft.organiseesPar} onChange={(event) => patch({ organiseesPar: event.target.value })} />
            </Field>
            <Field label={t("discussWith")}>
              <input className={inputClass} value={draft.discuterAvec} onChange={(event) => patch({ discuterAvec: event.target.value })} />
            </Field>
            <Field label={t("proposals")} hint={t("proposalsHint")}>
              <textarea className={`${inputClass} min-h-32`} value={draft.propositions} onChange={(event) => patch({ propositions: event.target.value })} />
            </Field>
            <Field label={t("remarks")}>
              <textarea className={`${inputClass} min-h-28`} value={draft.remarques} onChange={(event) => patch({ remarques: event.target.value })} />
            </Field>
          </div>
        ) : null}
        {step === 7 ? (
          <StepClose
            draft={draft}
            missing={missing}
            photoError={photoError}
            exportState={exportState}
            exportError={exportError}
            confirmDelete={confirmDelete}
            onPatch={patch}
            onAddFiles={addFiles}
            onRemovePhoto={(id) => patch({ photos: draft.photos.filter((photo) => photo.id !== id) })}
            onExport={exportPdf}
            onAskDelete={() => setConfirmDelete(true)}
            onCancelDelete={() => setConfirmDelete(false)}
            onDelete={() => onDelete(draft.id)}
          />
        ) : null}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-safe">
        <div className="mx-auto flex max-w-xl gap-2 px-4 py-3">
          <button
            type="button"
            className="inline-flex h-12 flex-1 items-center justify-center gap-1 rounded-xl border border-line text-sm font-semibold text-ink disabled:opacity-40"
            disabled={step === 0}
            onClick={() => setStep((value) => Math.max(0, value - 1))}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {t("previous")}
          </button>
          {step < STEP_COUNT - 1 ? (
            <button
              type="button"
              className="inline-flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-pine text-sm font-semibold text-bg"
              onClick={() => setStep((value) => Math.min(STEP_COUNT - 1, value + 1))}
            >
              {t("next")}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-amber text-sm font-semibold text-bg disabled:opacity-40"
              disabled={missing.length > 0 || exportState === "map" || exportState === "pdf"}
              onClick={exportPdf}
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              {t("exportPdf")}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

function missingBits(releve: Releve, d: Dict): string[] {
  const missing: string[] = [];
  if (!releve.processus) missing.push(d["missing.hazard"]);
  if (!releve.date) missing.push(d["missing.date"]);
  if (!releve.x || !releve.y) missing.push(d["missing.position"]);
  if (!releve.rapporteur.trim()) missing.push(d["missing.reporter"]);
  return missing;
}

function StepProcess({ value, onChange }: { value: ProcessusId | ""; onChange: (id: ProcessusId) => void }) {
  const { t } = useI18n();
  const featured = PROCESSUS.filter((item) => item.featured);
  const extra = PROCESSUS.filter((item) => !item.featured);
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-muted">{t("processNote")}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {featured.map((item) => {
          const Icon = ICONS[item.id];
          const active = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(item.id)}
              className={`rounded-xl border px-3 py-4 text-left ${choiceClass(active)}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="mt-3 block text-base font-semibold leading-snug">{t(`processus.${item.id}.label` as keyof Dict)}</span>
              <span className={`mt-1 block text-sm ${active ? "text-bg/80" : "text-muted"}`}>{t(`processus.${item.id}.hint` as keyof Dict)}</span>
            </button>
          );
        })}
      </div>
      {extra.map((item) => {
        const Icon = ICONS[item.id];
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.id)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left ${choiceClass(active)}`}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>
              <span className="block text-sm font-semibold">{t(`processus.${item.id}.label` as keyof Dict)}</span>
              <span className={`block text-sm ${active ? "text-bg/80" : "text-muted"}`}>{t(`processus.${item.id}.hint` as keyof Dict)}</span>
            </span>
          </button>
        );
      })}
      <p className="text-sm leading-relaxed text-muted">
        {t("processNote2")}
      </p>
    </div>
  );
}

function StepPlace({
  draft,
  outside,
  gpsBusy,
  gpsError,
  communeBusy,
  communeNote,
  onLocate,
  onCommune,
  onPick,
  onCoord,
  onCommuneText,
}: {
  draft: Releve;
  outside: boolean;
  gpsBusy: boolean;
  gpsError: keyof Dict | null;
  communeBusy: boolean;
  communeNote: keyof Dict | null;
  onLocate: () => void;
  onCommune: () => void;
  onPick: (lat: number, lng: number) => void;
  onCoord: (axis: "x" | "y", value: string) => void;
  onCommuneText: (value: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        {t("placeIntro")}
      </p>
      <FieldMap lat={draft.lat} lng={draft.lng} onPick={onPick} />
      <button
        type="button"
        onClick={onLocate}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-pine text-sm font-semibold text-pine"
      >
        <LocateFixed className="h-4 w-4" aria-hidden="true" />
        {gpsBusy ? t("locating") : t("useMyPosition")}
      </button>
      {gpsError ? <p className="text-sm text-ink">{t(gpsError)}</p> : null}
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("xLabel")}>
          <input
            className={inputClass}
            inputMode="numeric"
            value={draft.x}
            onChange={(event) => onCoord("x", event.target.value)}
          />
        </Field>
        <Field label={t("yLabel")}>
          <input
            className={inputClass}
            inputMode="numeric"
            value={draft.y}
            onChange={(event) => onCoord("y", event.target.value)}
          />
        </Field>
      </div>
      {draft.x && draft.y ? (
        <p className="text-sm text-ink">
          {groupDigits(draft.x)} / {groupDigits(draft.y)}
          {outside ? t("outsideSwitzerland") : ""}
        </p>
      ) : null}
      <Field label={t("commune")}>
        <input className={inputClass} value={draft.commune} onChange={(event) => onCommuneText(event.target.value)} />
      </Field>
      <button
        type="button"
        onClick={onCommune}
        className="text-sm font-semibold text-pine"
      >
        {communeBusy ? t("findingCommune") : t("fillCommune")}
      </button>
      {communeNote ? <p className="text-sm text-muted">{t(communeNote)}</p> : null}
    </div>
  );
}

function StepClose({
  draft,
  missing,
  photoError,
  exportState,
  exportError,
  confirmDelete,
  onPatch,
  onAddFiles,
  onRemovePhoto,
  onExport,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  draft: Releve;
  missing: string[];
  photoError: keyof Dict | null;
  exportState: "idle" | "map" | "pdf" | "done" | "error";
  exportError: string | null;
  confirmDelete: boolean;
  onPatch: (partial: Partial<Releve>) => void;
  onAddFiles: (files: FileList | null) => void;
  onRemovePhoto: (id: string) => void;
  onExport: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  const urls = usePhotoUrls(draft.photos);
  const { t, d } = useI18n();
  const option = processusById(draft.processus);
  return (
    <div className="space-y-5">
      <Field label={t("reporterLabel")}>
        <input className={inputClass} autoComplete="name" value={draft.rapporteur} onChange={(event) => onPatch({ rapporteur: event.target.value })} />
      </Field>
      <Field label={t("reportDate")}>
        <input className={inputClass} type="date" value={draft.dateRapport} onChange={(event) => onPatch({ dateRapport: event.target.value })} />
      </Field>

      <div>
        <p className="text-sm font-semibold text-ink">{t("photosTitle")}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t("photosHint")}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="flex h-12 items-center justify-center gap-2 rounded-xl bg-pine text-sm font-semibold text-bg">
            <Camera className="h-4 w-4" aria-hidden="true" />
            {t("takePhoto")}
            <input className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event) => { onAddFiles(event.target.files); event.target.value = ""; }} />
          </label>
          <label className="flex h-12 items-center justify-center gap-2 rounded-xl border border-line text-sm font-semibold text-ink">
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            {t("gallery")}
            <input className="sr-only" type="file" accept="image/*" multiple onChange={(event) => { onAddFiles(event.target.files); event.target.value = ""; }} />
          </label>
        </div>
        {photoError ? <p className="mt-2 text-sm text-ink">{t(photoError)}</p> : null}
        {draft.photos.length > 0 ? (
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {draft.photos.map((photo) => (
              <li key={photo.id} className="relative">
                {urls[photo.id] ? (
                  <img src={urls[photo.id]} alt={photo.name} className="aspect-square w-full rounded-lg object-cover" />
                ) : (
                  <div className="aspect-square w-full rounded-lg bg-line" />
                )}
                <button
                  type="button"
                  aria-label={d.removePhoto(photo.name)}
                  className="absolute right-1 top-1 rounded-md bg-ink/80 px-2 py-1 text-xs text-bg"
                  onClick={() => onRemovePhoto(photo.id)}
                >
                  {t("remove")}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="rounded-xl border border-line bg-surface px-4 py-4 text-sm leading-relaxed text-ink">
        <p className="font-semibold">{option ? t(`processus.${option.id}.label` as keyof Dict) : t("hazardNotChosen")}</p>
        <p className="mt-1 text-muted">
          {draft.commune || t("communeNotEntered")}
          {draft.x && draft.y ? ` · X ${groupDigits(draft.x)} / Y ${groupDigits(draft.y)}` : ""}
        </p>
        <p className="mt-3">
          {t("closeNote")}
        </p>
        {missing.length > 0 ? (
          <p className="mt-3 font-semibold">{d.missingBefore(missing.join(", "))}</p>
        ) : (
          <p className="mt-3 text-muted">{t("ready")}</p>
        )}
        {exportState === "map" ? <p className="mt-2">{t("preparingMap")}</p> : null}
        {exportState === "pdf" ? <p className="mt-2">{t("writingReport")}</p> : null}
        {exportState === "done" ? <p className="mt-2">{t("exported")}</p> : null}
        {exportError ? <p className="mt-2">{exportError}</p> : null}
        <button
          type="button"
          onClick={onExport}
          disabled={missing.length > 0 || exportState === "map" || exportState === "pdf"}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber text-sm font-semibold text-bg disabled:opacity-40"
        >
          <FileDown className="h-4 w-4" aria-hidden="true" />
          {t("exportPdf")}
        </button>
      </div>

      <div className="flex justify-end">
        {confirmDelete ? (
          <div className="flex gap-2">
            <button type="button" className="px-3 py-2 text-sm text-muted" onClick={onCancelDelete}>{t("cancel")}</button>
            <button type="button" className="rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-bg" onClick={onDelete}>
              {t("deleteReleve")}
            </button>
          </div>
        ) : (
          <button type="button" className="inline-flex items-center gap-1 px-2 py-2 text-sm text-muted" onClick={onAskDelete}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t("delete")}
          </button>
        )}
      </div>
    </div>
  );
}

function usePhotoUrls(photos: Photo[]) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const photo of photos) next[photo.id] = URL.createObjectURL(photo.blob);
    setUrls(next);
    return () => {
      for (const url of Object.values(next)) URL.revokeObjectURL(url);
    };
  }, [photos]);
  return urls;
}
