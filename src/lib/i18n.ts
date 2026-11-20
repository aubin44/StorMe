import { useCallback, useSyncExternalStore } from "react";

export type Lang = "fr" | "de";

const STORAGE_KEY = "alea-lang";

const fr = {
  appTagline: "Relevés de dangers naturels",
  langLabel: "Langue",
  loadError: "La mémoire de l'appareil n'est pas accessible.",
  loading: "Ouverture des relevés…",

  // steps
  "step.0.title": "Aléa",
  "step.0.kicker": "Processus principal",
  "step.1.title": "Lieu",
  "step.1.kicker": "Commune et MN95",
  "step.2.title": "Moment",
  "step.2.kicker": "Date de l'événement",
  "step.3.title": "Processus",
  "step.3.kicker": "Description succincte",
  "step.4.title": "Causes et dégâts",
  "step.4.kicker": "Ce qui s'est passé",
  "step.5.title": "Risques",
  "step.5.kicker": "Suite possible",
  "step.6.title": "Mesures",
  "step.6.kicker": "Première appréciation",
  "step.7.title": "Rapport",
  "step.7.kicker": "Remarques, rapporteur, photos",

  // home
  newReleve: "Nouveau relevé",
  homeIntro: "Chute de pierre, effondrement, glissement spontané ou avalanche. Le dossier reste sur cet appareil.",
  emptyTitle: "Aucun relevé",
  emptyBody:
    "Placez le point sur la carte nationale, joignez les photos, puis exportez le rapport StorMe encore modifiable.",
  installTitle: "Installer sur l'écran d'accueil",
  installBody:
    "Dans le menu du navigateur : « Ajouter à l'écran d'accueil » ou « Installer ». L'icône est le triangle de danger naturel.",
  install: "Installer",
  later: "Plus tard",
  cancel: "Annuler",
  delete: "Supprimer",
  deleteReleve: "Supprimer ce relevé",
  back: "Retour à la liste",
  previous: "Précédent",
  next: "Suivant",
  exportPdf: "Exporter le PDF",

  // record card
  releveStarted: "Relevé commencé",
  communeToSpecify: "Commune à préciser",
  datePending: "date à préciser",
  positionNotSet: "Position pas encore posée",
  photoCount: (n: number) => `${n} photo${n > 1 ? "s" : ""}`,

  // processus
  "processus.chute.label": "Chute de pierre / bloc",
  "processus.chute.hint": "Blocs isolés, éboulement rocheux",
  "processus.effondrement.label": "Effondrement",
  "processus.effondrement.hint": "Falaise ou masse qui s’écroule",
  "processus.glissement.label": "Glissement de terrain spontané",
  "processus.glissement.hint": "Mouvement de versant",
  "processus.avalanche.label": "Avalanche",
  "processus.avalanche.hint": "Neige ou coulée",
  "processus.crue.label": "Crue, inondation, laves torrentielles",
  "processus.crue.hint": "Aussi érosion latérale et charriage",
  processNote:
    "Un seul processus principal. Il coche la case correspondante du formulaire fribourgeois.",
  pdfTypePrefix: "Type",

  // importance / mesures
  "importance.negligeable": "Négligeable",
  "importance.normale": "Normale",
  "importance.exceptionnelle": "Exceptionnelle",
  "importance.extreme": "Extrême",
  "mesures.pas": "Mesures pas nécessaires",
  "mesures.immediat": "Mesures nécessaires immédiatement",
  "mesures.plustard": "Mesures nécessaires plus tard",

  // place
  placeIntro:
    "Touchez la carte nationale pour placer l'aléa. X est la coordonnée vers l'est (E), Y vers le nord (N), en MN95.",
  useMyPosition: "Utiliser ma position",
  locating: "Recherche de la position…",
  xLabel: "X · est (E)",
  yLabel: "Y · nord (N)",
  outsideSwitzerland: " — hors de l'emprise habituelle de la Suisse.",
  commune: "Commune",
  fillCommune: "Remplir la commune depuis la position",
  findingCommune: "Recherche de la commune…",
  gpsUnsupported: "Cet appareil ne fournit pas la position.",
  gpsDenied: "Position refusée ou indisponible. Placez le point sur la carte, ou saisissez X / Y.",
  placeFirst: "Posez d'abord la position.",
  communeNotFound: "Commune introuvable. Saisissez-la à la main.",
  networkDown: "Réseau indisponible. Saisissez la commune.",

  // moment
  date: "Date",
  dateHint: "Jour de l'événement, pas forcément celui du relevé.",
  time: "Heure",
  duration: "Durée",
  durationHint: "Facultatif · ex. 20 min, 3 h",

  // texts
  descLabel: "Description succincte du processus",
  descHint: "Type, volumes estimés, surfaces, intensité, événement isolé ou fréquent.",
  causesLabel: "Causes principales",
  causesHint: "Météorologique, purement naturel, ouvrages, infrastructures insuffisantes…",
  damageLabel: "Description des dégâts",
  damageHint: "Personnes, biens, infrastructures.",
  risksLabel: "Évaluation des risques restants",
  risksHint: "Un événement similaire peut-il se reproduire ? Une situation dangereuse a-t-elle été créée ?",
  importanceLabel: "Importance de l'événement",
  measuresLabel: "Mesures",
  organizedBy: "Mesures déjà organisées par",
  discussWith: "Mesures à discuter avec",
  proposals: "Propositions de mesures",
  proposalsHint: "Assainissement, sécurisation, organisation.",
  remarks: "11. Remarques / divers",

  // close
  reporterLabel: "Nom et fonction du rapporteur",
  reportDate: "Date du rapport",
  photosTitle: "Photos du processus",
  photosHint: "Elles sont ajoutées en annexe du PDF.",
  takePhoto: "Prendre",
  gallery: "Galerie",
  remove: "Retirer",
  removePhoto: (name: string) => `Retirer ${name}`,
  photoMax: "Douze photos au maximum par relevé.",
  photoUnreadable: "Une photo n'a pas pu être lue. Utilisez un JPG ou un PNG.",
  hazardNotChosen: "Aléa non choisi",
  communeNotEntered: "Commune non saisie",
  missingBefore: (list: string) => `Avant l'export, il manque ${list}.`,
  ready: "Prêt à exporter.",
  preparingMap: "Préparation de la carte nationale…",
  writingReport: "Écriture du rapport…",
  exported: "Rapport téléchargé. Vous pouvez encore modifier les champs dans le PDF.",
  exportFailed: "L'export a échoué.",
  "missing.hazard": "l'aléa",
  "missing.date": "la date",
  "missing.position": "la position MN95",
  "missing.reporter": "le nom du rapporteur",
  and: " et ",

  // pdf
  "step.8.title": "Récapitulatif",
  "step.8.kicker": "Vérifier avant l'export",
  save: "Enregistrer",
  saved: "Relevé enregistré sur l'appareil.",
  sendMail: "Envoyer par e-mail",
  mailed: "PDF téléchargé : joignez-le à l'e-mail qui s'ouvre.",
  mailSubject: (kind: string, place: string, date: string) => `Relevé StorMe - ${kind} - ${place} - ${date}`,
  mailBody: (kind: string, place: string, date: string, e: string, n: string, who: string) =>
    `Bonjour,\n\nVeuillez trouver ci-joint le relevé StorMe (PDF en pièce jointe).\n\nProcessus : ${kind}\nCommune : ${place}\nDate : ${date}\nMN95 : X ${e} / Y ${n}\n\nCordialement,\n${who}`,
  recapIntro: "Relisez le relevé. Touchez « Modifier » pour corriger une rubrique, puis exportez ou envoyez.",
  recapEdit: "Modifier",
  notFilled: "Non renseigné",
  exportTitle: "Export",
  forwardTo: (addr: string) => `À transférer à ${addr} (SFN)`,
  shared: "Rapport partagé.",
  recordsTitle: (n: number) => (n > 1 ? `Mes relevés (${n})` : `Mon relevé (${n})`),
  statusReady: "Prêt à exporter",
  statusDraft: "À compléter",
  optional: "Facultatif",
  communeHint: "Proposée d'après la position, vous pouvez la modifier.",
  offlineSave: "Garder cette zone hors ligne",
  offlineHint: "Enregistre la carte (environ 1,5 km autour du point) pour l'utiliser sans réseau.",
  offlineBusy: (done: number, total: number) => `Téléchargement de la carte… ${done} / ${total}`,
  offlineDone: "Zone enregistrée : la carte reste disponible hors ligne.",
  offlinePartial: "Zone enregistrée en partie seulement (réseau instable). Réessayez avec du réseau.",
  offlineFail: "Impossible d'enregistrer la carte.",
  pdfFormMissing: "Le formulaire officiel est introuvable.",
  pdfHeader: "Aléa  ·  annexe au rapport simplifié",
  pdfMapTitle: "Position de l'aléa sur la carte nationale",
  pdfPhotosTitle: "Photos du processus",
  pdfPlaceUnknown: "Commune non précisée",
  pdfDateUnknown: "date non précisée",
  pdfHazardUnknown: "Aléa non précisé",
  pdfCoords: (e: string, n: string) => `MN95    X = E (est)  ${e}      Y = N (nord)  ${n}`,
  pdfNoPosition: "Aucune position n'a été enregistrée : le fond de carte n'a pas pu être produit.",
  pdfOffline: "Fond de carte indisponible (hors ligne). Les coordonnées MN95 ci-dessus localisent l'aléa.",
  pdfNote1: "Le n° StorMe n'est pas rempli : il est attribué par la SFN centrale.",
  pdfNote2: "Le point 10 du formulaire est laissé vide. Tous les champs du formulaire restent modifiables.",
  pdfAppendix: "Annexe A",
  pdfPhotoCaption: (i: number, total: number, name: string) => `Photo ${i} / ${total}  ·  ${name}`,
  pdfFilePrefix: "Releve",
  pdfNoPlace: "sans-lieu",
  pdfNoDate: "sans-date",
  pdfFieldTerrain: "terrain",
};

export type Dict = typeof fr;

const de: Dict = {
  appTagline: "Naturgefahren-Erhebungen",
  langLabel: "Sprache",
  loadError: "Der Gerätespeicher ist nicht zugänglich.",
  loading: "Erhebungen werden geöffnet…",

  "step.0.title": "Gefahr",
  "step.0.kicker": "Hauptprozess",
  "step.1.title": "Ort",
  "step.1.kicker": "Gemeinde und LV95",
  "step.2.title": "Zeitpunkt",
  "step.2.kicker": "Datum des Ereignisses",
  "step.3.title": "Prozess",
  "step.3.kicker": "Kurzbeschreibung",
  "step.4.title": "Ursachen und Schäden",
  "step.4.kicker": "Was geschehen ist",
  "step.5.title": "Risiken",
  "step.5.kicker": "Mögliche Folgen",
  "step.6.title": "Massnahmen",
  "step.6.kicker": "Erste Beurteilung",
  "step.7.title": "Bericht",
  "step.7.kicker": "Bemerkungen, Berichterstatter, Fotos",

  newReleve: "Neue Erhebung",
  homeIntro:
    "Steinschlag, Einsturz, spontane Rutschung oder Lawine. Die Daten bleiben auf diesem Gerät.",
  emptyTitle: "Keine Erhebung",
  emptyBody:
    "Setzen Sie den Punkt auf die Landeskarte, fügen Sie die Fotos hinzu und exportieren Sie dann den noch bearbeitbaren StorMe-Bericht.",
  installTitle: "Auf dem Startbildschirm installieren",
  installBody:
    "Im Browsermenü: «Zum Startbildschirm hinzufügen» oder «Installieren». Das Symbol ist das Naturgefahren-Dreieck.",
  install: "Installieren",
  later: "Später",
  cancel: "Abbrechen",
  delete: "Löschen",
  deleteReleve: "Diese Erhebung löschen",
  back: "Zurück zur Liste",
  previous: "Zurück",
  next: "Weiter",
  exportPdf: "PDF exportieren",

  releveStarted: "Begonnene Erhebung",
  communeToSpecify: "Gemeinde angeben",
  datePending: "Datum angeben",
  positionNotSet: "Position noch nicht gesetzt",
  photoCount: (n: number) => `${n} Foto${n > 1 ? "s" : ""}`,

  "processus.chute.label": "Steinschlag / Blockschlag",
  "processus.chute.hint": "Einzelne Blöcke, Felssturz",
  "processus.effondrement.label": "Einsturz",
  "processus.effondrement.hint": "Felswand oder Masse, die einstürzt",
  "processus.glissement.label": "Spontane Rutschung",
  "processus.glissement.hint": "Hangbewegung",
  "processus.avalanche.label": "Lawine",
  "processus.avalanche.hint": "Schnee oder Fliessbewegung",
  "processus.crue.label": "Hochwasser, Überschwemmung, Murgang",
  "processus.crue.hint": "Auch Seitenerosion und Geschiebe",
  processNote:
    "Nur ein Hauptprozess. Er kreuzt das entsprechende Kästchen im Freiburger Formular an.",
  pdfTypePrefix: "Typ",

  "importance.negligeable": "Vernachlässigbar",
  "importance.normale": "Normal",
  "importance.exceptionnelle": "Aussergewöhnlich",
  "importance.extreme": "Extrem",
  "mesures.pas": "Keine Massnahmen nötig",
  "mesures.immediat": "Massnahmen sofort nötig",
  "mesures.plustard": "Massnahmen später nötig",

  placeIntro:
    "Tippen Sie auf die Landeskarte, um die Gefahr zu setzen. X ist die Koordinate nach Osten (E), Y nach Norden (N), in LV95.",
  useMyPosition: "Meine Position verwenden",
  locating: "Position wird gesucht…",
  xLabel: "X · Ost (E)",
  yLabel: "Y · Nord (N)",
  outsideSwitzerland: " — ausserhalb des üblichen Bereichs der Schweiz.",
  commune: "Gemeinde",
  fillCommune: "Gemeinde aus der Position ausfüllen",
  findingCommune: "Gemeinde wird gesucht…",
  gpsUnsupported: "Dieses Gerät liefert keine Position.",
  gpsDenied:
    "Position verweigert oder nicht verfügbar. Setzen Sie den Punkt auf der Karte oder geben Sie X / Y ein.",
  placeFirst: "Setzen Sie zuerst die Position.",
  communeNotFound: "Gemeinde nicht gefunden. Bitte von Hand eingeben.",
  networkDown: "Netz nicht verfügbar. Bitte die Gemeinde eingeben.",

  date: "Datum",
  dateHint: "Tag des Ereignisses, nicht unbedingt der Tag der Erhebung.",
  time: "Uhrzeit",
  duration: "Dauer",
  durationHint: "Fakultativ · z. B. 20 Min., 3 Std.",

  descLabel: "Kurzbeschreibung des Prozesses",
  descHint: "Typ, geschätzte Volumen, Flächen, Intensität, Einzelereignis oder häufig.",
  causesLabel: "Hauptursachen",
  causesHint: "Meteorologisch, rein natürlich, Bauwerke, ungenügende Infrastruktur…",
  damageLabel: "Beschreibung der Schäden",
  damageHint: "Personen, Sachwerte, Infrastruktur.",
  risksLabel: "Beurteilung der Restrisiken",
  risksHint:
    "Kann sich ein ähnliches Ereignis wiederholen? Wurde eine gefährliche Situation geschaffen?",
  importanceLabel: "Bedeutung des Ereignisses",
  measuresLabel: "Massnahmen",
  organizedBy: "Massnahmen bereits organisiert durch",
  discussWith: "Massnahmen zu besprechen mit",
  proposals: "Massnahmenvorschläge",
  proposalsHint: "Sanierung, Sicherung, Organisation.",
  remarks: "11. Bemerkungen / Verschiedenes",

  reporterLabel: "Name und Funktion des Berichterstatters",
  reportDate: "Datum des Berichts",
  photosTitle: "Fotos des Prozesses",
  photosHint: "Sie werden im Anhang des PDF eingefügt.",
  takePhoto: "Aufnehmen",
  gallery: "Galerie",
  remove: "Entfernen",
  removePhoto: (name: string) => `${name} entfernen`,
  photoMax: "Höchstens zwölf Fotos pro Erhebung.",
  photoUnreadable: "Ein Foto konnte nicht gelesen werden. Verwenden Sie JPG oder PNG.",
  hazardNotChosen: "Gefahr nicht gewählt",
  communeNotEntered: "Gemeinde nicht eingegeben",
  missingBefore: (list: string) => `Vor dem Export fehlt: ${list}.`,
  ready: "Bereit zum Export.",
  preparingMap: "Landeskarte wird vorbereitet…",
  writingReport: "Bericht wird geschrieben…",
  exported: "Bericht heruntergeladen. Sie können die Felder im PDF weiterhin bearbeiten.",
  exportFailed: "Der Export ist fehlgeschlagen.",
  "missing.hazard": "die Gefahr",
  "missing.date": "das Datum",
  "missing.position": "die LV95-Position",
  "missing.reporter": "der Name des Berichterstatters",
  and: " und ",

  "step.8.title": "Zusammenfassung",
  "step.8.kicker": "Vor dem Export prüfen",
  save: "Speichern",
  saved: "Erhebung auf dem Gerät gespeichert.",
  sendMail: "Per E-Mail senden",
  mailed: "PDF heruntergeladen: Hängen Sie es an die sich öffnende E-Mail an.",
  mailSubject: (kind: string, place: string, date: string) => `StorMe-Erhebung - ${kind} - ${place} - ${date}`,
  mailBody: (kind: string, place: string, date: string, e: string, n: string, who: string) =>
    `Guten Tag\n\nIm Anhang finden Sie die StorMe-Erhebung (PDF).\n\nProzess: ${kind}\nGemeinde: ${place}\nDatum: ${date}\nLV95: X ${e} / Y ${n}\n\nFreundliche Grüsse\n${who}`,
  recapIntro: "Lesen Sie die Erhebung durch. Tippen Sie auf «Ändern», um eine Rubrik zu korrigieren, und exportieren oder senden Sie dann.",
  recapEdit: "Ändern",
  notFilled: "Nicht ausgefüllt",
  exportTitle: "Export",
  forwardTo: (addr: string) => `Weiterzuleiten an ${addr} (SFN)`,
  shared: "Bericht geteilt.",
  recordsTitle: (n: number) => (n > 1 ? `Meine Erhebungen (${n})` : `Meine Erhebung (${n})`),
  statusReady: "Bereit zum Export",
  statusDraft: "Zu vervollständigen",
  optional: "Fakultativ",
  communeHint: "Aus der Position vorgeschlagen, Sie können sie ändern.",
  offlineSave: "Diesen Bereich offline behalten",
  offlineHint: "Speichert die Karte (ca. 1,5 km um den Punkt) für die Nutzung ohne Netz.",
  offlineBusy: (done: number, total: number) => `Karte wird heruntergeladen… ${done} / ${total}`,
  offlineDone: "Bereich gespeichert: Die Karte bleibt offline verfügbar.",
  offlinePartial: "Bereich nur teilweise gespeichert (instabiles Netz). Versuchen Sie es mit Netz erneut.",
  offlineFail: "Die Karte konnte nicht gespeichert werden.",
  pdfFormMissing: "Das offizielle Formular wurde nicht gefunden.",
  pdfHeader: "Aléa  ·  Anhang zum vereinfachten Bericht",
  pdfMapTitle: "Lage der Gefahr auf der Landeskarte",
  pdfPhotosTitle: "Fotos des Prozesses",
  pdfPlaceUnknown: "Gemeinde nicht angegeben",
  pdfDateUnknown: "Datum nicht angegeben",
  pdfHazardUnknown: "Gefahr nicht angegeben",
  pdfCoords: (e: string, n: string) => `LV95    X = E (Ost)  ${e}      Y = N (Nord)  ${n}`,
  pdfNoPosition: "Es wurde keine Position gespeichert: die Hintergrundkarte konnte nicht erstellt werden.",
  pdfOffline:
    "Hintergrundkarte nicht verfügbar (offline). Die LV95-Koordinaten oben lokalisieren die Gefahr.",
  pdfNote1: "Die StorMe-Nr. ist nicht ausgefüllt: sie wird von der zentralen Stelle vergeben.",
  pdfNote2: "Punkt 10 des Formulars bleibt leer. Alle Formularfelder bleiben bearbeitbar.",
  pdfAppendix: "Anhang A",
  pdfPhotoCaption: (i: number, total: number, name: string) => `Foto ${i} / ${total}  ·  ${name}`,
  pdfFilePrefix: "Erhebung",
  pdfNoPlace: "ohne-ort",
  pdfNoDate: "ohne-datum",
  pdfFieldTerrain: "gelaende",
};

const dictionaries: Record<Lang, Dict> = { fr, de };

let current: Lang = "fr";
let initialised = false;
const listeners = new Set<() => void>();

function detect(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "fr" || saved === "de") return saved;
  } catch {
    /* private mode */
  }
  return typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("de") ? "de" : "fr";
}

function init() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;
  current = detect();
  document.documentElement.lang = current;
  if (current === "de") document.title = "Aléa — Naturgefahren-Erhebungen";
}

function subscribe(listener: () => void) {
  init();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Lang {
  init();
  return current;
}

export function setLang(lang: Lang) {
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* private mode */
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
    document.title = lang === "de" ? "Aléa — Naturgefahren-Erhebungen" : "Aléa — Relevés de dangers naturels";
  }
  listeners.forEach((listener) => listener());
}

/** Current language outside React (e.g. for the PDF export). */
export function currentLang(): Lang {
  return getSnapshot();
}

export function translate(lang: Lang, key: keyof Dict): string {
  const value = dictionaries[lang][key];
  return typeof value === "string" ? value : String(key);
}

export function dict(lang: Lang): Dict {
  return dictionaries[lang];
}

export function useI18n() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, () => "fr" as Lang);
  const d = dictionaries[lang];
  const t = useCallback((key: keyof Dict) => translate(lang, key), [lang]);
  return { lang, t, d, setLang };
}
