import {
  PDFBool,
  PDFDocument,
  PDFName,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
  type PDFImage,
} from "pdf-lib";
import { groupDigits } from "@/lib/releve/coords";
import { dict, type Dict, type Lang } from "@/lib/i18n";
import { IMPORTANCE, MESURES, processusById, type Releve } from "@/lib/releve/types";

function winAnsi(value: string): string {
  return value
    .replace(/\u0153/g, "oe")
    .replace(/\u0152/g, "OE")
    .replace(/\u202f|\u00a0/g, " ")
    .replace(/[—–]/g, "-")
    .replace(/[‘’‚]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/[^\n\r\t\u0020-\u00ff]/g, "");
}

function frDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return iso.trim();
  return `${match[3]}.${match[2]}.${match[1]}`;
}

function descriptionForPdf(releve: Releve, d: Dict): string {
  const option = processusById(releve.processus);
  const body = releve.description.trim();
  if (!option) return body;
  const prefix = d.pdfTypePrefix;
  const head = `${prefix} : ${d[`processus.${option.id}.label` as keyof Dict] as string}.`;
  if (!body) return head;
  if (/^(type|typ) :/i.test(body)) return body;
  return `${head}\n${body}`;
}

function downloadName(releve: Releve, d: Dict): string {
  const place = (releve.commune || d.pdfNoPlace)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const day = releve.date || d.pdfNoDate;
  return `${d.pdfFilePrefix}-${place || d.pdfFieldTerrain}-${day}.pdf`;
}

function drawHeader(page: PDFPage, bold: PDFFont, headerText: string, title: string) {
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: height - 46, width, height: 46, color: rgb(0.106, 0.227, 0.184) });
  page.drawText(winAnsi(headerText), {
    x: 36,
    y: height - 28,
    size: 11,
    font: bold,
    color: rgb(0.957, 0.941, 0.902),
  });
  page.drawText(winAnsi(title), {
    x: 36,
    y: height - 70,
    size: 13,
    font: bold,
    color: rgb(0.11, 0.098, 0.082),
  });
}

export async function buildRelevePdf(
  releve: Releve,
  mapPng: Uint8Array | null,
  lang: Lang = "fr",
): Promise<{ bytes: Uint8Array; filename: string }> {
  const d = dict(lang);
  const response = await fetch(`${import.meta.env.BASE_URL}formulaire-storme.pdf`);
  if (!response.ok) throw new Error(d.pdfFormMissing);
  const doc = await PDFDocument.load(await response.arrayBuffer());
  const form = doc.getForm();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const text = (name: string, value: string, size: number) => {
    const field = form.getTextField(name);
    field.setText(winAnsi(value));
    field.setFontSize(size);
  };

  const checkOnly = (names: string[], selected: string | null) => {
    for (const name of names) {
      const box = form.getCheckBox(name);
      if (selected && name === selected) box.check();
      else box.uncheck();
    }
  };

  const option = processusById(releve.processus);
  text("No StorMe", "", 11);
  text("Commune", releve.commune.trim(), 10);
  text("X", releve.x.replace(/\D/g, ""), 8);
  text("Y", releve.y.replace(/\D/g, ""), 8);
  text("Date", frDate(releve.date), 10);
  text("Heure", releve.heure.trim(), 10);
  text("Durée", releve.duree.trim(), 9);
  text("4. Description succincte du processus", descriptionForPdf(releve, d), 9);
  text("5. Causes principales de l'évenement", releve.causes.trim(), 9);
  text("6 Description des dégâts", releve.degats.trim(), 9);
  text("7. Evaluation des risques restants", releve.risques.trim(), 9);
  text("Mesures sont déjà organisées par", releve.organiseesPar.trim(), 9);
  text("Mesures sont à discuter avec", releve.discuterAvec.trim(), 9);
  text("Propositions de mesures", releve.propositions.trim(), 9);
  text("10. Personnes ou instances impliqués", "", 9);
  text("11 Remarques divers", releve.remarques.trim(), 9);
  text("Rapporteur", releve.rapporteur.trim(), 9);
  text("Date_releve", frDate(releve.dateRapport), 10);

  checkOnly(
    ["Avlanche", "Glissement", "Chute", "Eau"],
    option?.pdf ?? null,
  );
  checkOnly(
    IMPORTANCE.map((item) => item.pdf),
    IMPORTANCE.find((item) => item.id === releve.importance)?.pdf ?? null,
  );
  checkOnly(
    MESURES.map((item) => item.pdf),
    MESURES.find((item) => item.id === releve.mesures)?.pdf ?? null,
  );
  checkOnly(["1 Carte", "2 Photo"], null);

  form.updateFieldAppearances(font);
  try {
    form.acroForm.dict.set(PDFName.of("NeedAppearances"), PDFBool.True);
  } catch {
    /* the fields stay editable even if this flag cannot be set */
  }

  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const place = releve.commune.trim() || d.pdfPlaceUnknown;
  const when = frDate(releve.date) || d.pdfDateUnknown;
  const east = releve.x ? groupDigits(releve.x) : "-";
  const north = releve.y ? groupDigits(releve.y) : "-";
  const kind = option ? (d[`processus.${option.id}.label` as keyof Dict] as string) : d.pdfHazardUnknown;

  const mapPage = doc.addPage([595.22, 842]);
  drawHeader(mapPage, bold, d.pdfHeader, d.pdfMapTitle);
  mapPage.drawText(winAnsi(`${kind}  ·  ${place}  ·  ${when}`), {
    x: 36,
    y: 748,
    size: 10,
    font,
    color: rgb(0.42, 0.39, 0.36),
  });
  mapPage.drawText(winAnsi(d.pdfCoords(east, north)), {
    x: 36,
    y: 730,
    size: 11,
    font: bold,
    color: rgb(0.11, 0.098, 0.082),
  });

  if (mapPng) {
    const image = await doc.embedPng(mapPng);
    const maxW = 523;
    const maxH = 560;
    const scale = Math.min(maxW / image.width, maxH / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    const x = (595.22 - w) / 2;
    const y = 150;
    mapPage.drawRectangle({
      x: x - 1,
      y: y - 1,
      width: w + 2,
      height: h + 2,
      borderColor: rgb(0.106, 0.227, 0.184),
      borderWidth: 1,
    });
    mapPage.drawImage(image, { x, y, width: w, height: h });
  } else {
    mapPage.drawRectangle({
      x: 36,
      y: 280,
      width: 523,
      height: 400,
      color: rgb(0.957, 0.941, 0.902),
      borderColor: rgb(0.85, 0.82, 0.76),
      borderWidth: 1,
    });
    const note = releve.lat == null ? d.pdfNoPosition : d.pdfOffline;
    mapPage.drawText(winAnsi(note), {
      x: 52,
      y: 490,
      size: 11,
      font,
      color: rgb(0.11, 0.098, 0.082),
      maxWidth: 490,
      lineHeight: 15,
    });
  }

  mapPage.drawText(winAnsi(d.pdfNote1), {
    x: 36,
    y: 118,
    size: 9,
    font,
    color: rgb(0.42, 0.39, 0.36),
  });
  mapPage.drawText(winAnsi(d.pdfNote2), {
    x: 36,
    y: 104,
    size: 9,
    font,
    color: rgb(0.42, 0.39, 0.36),
  });
  mapPage.drawText(winAnsi(d.pdfAppendix), {
    x: 520,
    y: 28,
    size: 9,
    font,
    color: rgb(0.42, 0.39, 0.36),
  });

  if (releve.photos.length > 0) {
    let page: PDFPage | null = null;
    let cursor = 0;
    let index = 0;
    for (const photo of releve.photos) {
      index += 1;
      const bytes = new Uint8Array(await photo.blob.arrayBuffer());
      let image: PDFImage;
      try {
        image = await doc.embedJpg(bytes);
      } catch {
        try {
          image = await doc.embedPng(bytes);
        } catch {
          continue;
        }
      }
      const maxW = 523;
      const maxH = 320;
      const scale = Math.min(maxW / image.width, maxH / image.height, 1);
      const w = image.width * scale;
      const h = image.height * scale;
      if (!page || cursor - h < 70) {
        page = doc.addPage([595.22, 842]);
        drawHeader(page, bold, d.pdfHeader, d.pdfPhotosTitle);
        page.drawText(winAnsi(`${kind}  ·  ${place}  ·  ${when}`), {
          x: 36,
          y: 748,
          size: 10,
          font,
          color: rgb(0.42, 0.39, 0.36),
        });
        cursor = 720;
      }
      const x = (595.22 - w) / 2;
      const y = cursor - h;
      page.drawImage(image, { x, y, width: w, height: h });
      page.drawText(winAnsi(d.pdfPhotoCaption(index, releve.photos.length, photo.name)), {
        x: 36,
        y: y - 16,
        size: 9,
        font,
        color: rgb(0.42, 0.39, 0.36),
      });
      cursor = y - 36;
    }
  }

  const bytes = await doc.save();
  return { bytes, filename: downloadName(releve, d) };
}

export function savePdfFile(bytes: Uint8Array, filename: string) {
  const copy = new Uint8Array(bytes);
  const blob = new Blob([copy], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
