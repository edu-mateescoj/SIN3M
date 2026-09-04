const state = {
  sources: [],
  blocks: [],
  entries: [],
  transformations: [],
  validation: [],
  selectedBlockId: null,
  sourceRevision: 0,
  segmentationRevision: null,
  dependencies: {
    pdfjs: { available: false, version: null },
    mammoth: { available: false, version: null }
  }
};

const filesById = new Map();
const previewUrls = new Map();
let pdfjsLib = null;

const $ = id => document.getElementById(id);
const nowIso = () => new Date().toISOString();

function setStatus(message) {
  $('globalStatus').textContent = message;
}

function escapeText(value) {
  return String(value ?? '');
}

function slug(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function unique(values) {
  return [...new Set(values.filter(v => v !== null && v !== undefined && v !== ''))];
}

function humanBytes(bytes) {
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Kio';
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mio';
}

async function sha256Bytes(buffer) {
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Text(text) {
  return sha256Bytes(new TextEncoder().encode(text));
}

function normalizeOutputName(value, fallback) {
  let name = String(value || '').trim() || fallback;
  name = name.replace(/[\\/:*?"<>|]+/g, '-');
  if (!/\.json$/i.test(name)) name += '.json';
  return name;
}

function segmentationIsStale() {
  return !!state.entries.length && state.segmentationRevision !== state.sourceRevision;
}

function updateSegmentationNotice() {
  const box = $('segmentationNotice');
  if (!box) return;
  if (segmentationIsStale()) {
    box.className = 'warning';
    box.textContent = 'La transcription corrigée a changé après la construction des entrées. La segmentation actuelle est obsolète : reconstruisez-la avant export. Vos entrées actuelles restent visibles pour comparaison tant que vous ne reconstruisez pas.';
  } else {
    box.className = 'info';
    box.textContent = 'Sans dates : cliquez sur « Commencer / reconstruire la segmentation manuelle ». Le Builder crée une seule entrée depuis le texte corrigé ; placez ensuite le curseur dans cette entrée et utilisez « Scinder au curseur ».';
  }
}

function downloadJson(filename, object) {
  const blob = new Blob([JSON.stringify(object, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function sourceKindFromFile(file, requestedKind) {
  const name = file.name.toLowerCase();
  if (requestedKind === 'image') return 'image';
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.docx')) return 'docx';
  if (name.endsWith('.md')) return 'md';
  if (name.endsWith('.txt')) return 'txt';
  return 'unknown';
}

function sourceMime(file, type) {
  if (file.type) return file.type;
  return {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    md: 'text/markdown',
    txt: 'text/plain'
  }[type] || 'application/octet-stream';
}

function nextSourceId(kind) {
  const prefix = kind === 'image' ? 'IMAGE' : 'TRANSCRIPTION';
  const count = state.sources.filter(s => s.assetId.startsWith(prefix + '-')).length + 1;
  return prefix + '-' + String(count).padStart(3, '0');
}

async function addFiles(fileList, requestedKind) {
  for (const file of [...fileList]) {
    const type = sourceKindFromFile(file, requestedKind);
    if (type === 'unknown') {
      setStatus('Format ignoré : ' + file.name);
      continue;
    }

    const duplicate = state.sources.some(s => s.fileName === file.name && s.size === file.size);
    if (duplicate) continue;

    const assetId = nextSourceId(requestedKind === 'image' ? 'image' : 'transcription');
    const source = {
      assetId,
      kind: requestedKind === 'image' ? 'image' : 'transcription',
      sourceType: type,
      mediaType: sourceMime(file, type),
      fileName: file.name,
      size: file.size,
      lastModified: file.lastModified || null,
      sha256: null,
      pageCount: null,
      importedAt: nowIso(),
      extractedAt: null,
      extractionMessages: []
    };
    state.sources.push(source);
    filesById.set(assetId, file);

    if (requestedKind === 'image' && ['image/jpeg', 'image/png', 'image/webp'].includes(source.mediaType)) {
      const url = URL.createObjectURL(file);
      previewUrls.set(assetId, url);
    }

    renderSources();
    setStatus('Hash de ' + file.name + '…');
    try {
      source.sha256 = await sha256Bytes(await file.arrayBuffer());
    } catch (error) {
      source.extractionMessages.push('Hash impossible : ' + error.message);
    }
    renderSources();
  }
  setStatus('Sources prêtes.');
}

function removeSource(assetId) {
  const url = previewUrls.get(assetId);
  if (url) URL.revokeObjectURL(url);
  previewUrls.delete(assetId);
  filesById.delete(assetId);
  state.sources = state.sources.filter(s => s.assetId !== assetId);
  state.blocks = state.blocks.filter(b => b.sourceId !== assetId);
  state.entries.forEach(entry => {
    entry.assetRefs = entry.assetRefs.filter(id => id !== assetId);
  });
  renderSources();
  renderBlocks();
  renderEntries();
}

function clearSources() {
  for (const url of previewUrls.values()) URL.revokeObjectURL(url);
  previewUrls.clear();
  filesById.clear();
  state.sources = [];
  state.blocks = [];
  state.entries = [];
  state.transformations = [];
  state.selectedBlockId = null;
  renderSources();
  renderBlocks();
  renderEntries();
  setStatus('Sources et chantier vidés.');
}

function renderSources() {
  const box = $('sourceList');
  box.innerHTML = '';
  if (!state.sources.length) {
    box.className = 'card-list empty';
    box.textContent = 'Aucune source.';
    return;
  }
  box.className = 'card-list';

  state.sources.forEach(source => {
    const card = document.createElement('div');
    card.className = 'source-card';

    const head = document.createElement('div');
    head.className = 'source-head';

    const left = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'source-name';
    name.textContent = source.fileName;
    const details = document.createElement('div');
    details.className = 'small';
    details.textContent = [
      source.assetId,
      source.sourceType.toUpperCase(),
      humanBytes(source.size),
      source.sha256 ? 'SHA-256 ' + source.sha256.slice(0, 12) + '…' : 'hash en attente',
      source.pageCount ? source.pageCount + ' page(s)' : ''
    ].filter(Boolean).join(' · ');
    left.append(name, details);

    const remove = document.createElement('button');
    remove.textContent = 'Retirer';
    remove.className = 'danger';
    remove.addEventListener('click', () => removeSource(source.assetId));
    head.append(left, remove);
    card.appendChild(head);

    const preview = previewUrls.get(source.assetId);
    if (preview) {
      const img = document.createElement('img');
      img.src = preview;
      img.alt = 'Aperçu local ' + source.fileName;
      img.style.maxWidth = '180px';
      img.style.maxHeight = '120px';
      img.style.marginTop = '8px';
      img.style.border = '1px solid #d6dce2';
      img.style.borderRadius = '5px';
      card.appendChild(img);
    }

    if (source.extractionMessages.length) {
      const msg = document.createElement('div');
      msg.className = 'small';
      msg.style.marginTop = '6px';
      msg.textContent = source.extractionMessages.join(' · ');
      card.appendChild(msg);
    }
    box.appendChild(card);
  });
}

async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  try {
    pdfjsLib = await import('./vendor/pdfjs/pdf.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.mjs', import.meta.url).href;
    state.dependencies.pdfjs.available = true;
    state.dependencies.pdfjs.version = pdfjsLib.version || 'inconnue';
    return pdfjsLib;
  } catch (error) {
    state.dependencies.pdfjs.available = false;
    throw new Error('PDF.js local absent ou inaccessible. Exécutez setup-vendor.ps1 puis lancez via localhost. Détail : ' + error.message);
  }
}

function checkMammoth() {
  const available = !!(window.mammoth && typeof window.mammoth.extractRawText === 'function');
  state.dependencies.mammoth.available = available;
  state.dependencies.mammoth.version = available ? '1.12.2 (verrouillée)' : null;
  return available;
}

async function checkDependencies() {
  const messages = [];
  try {
    const lib = await loadPdfJs();
    messages.push('PDF.js OK — ' + (lib.version || 'version inconnue'));
  } catch (error) {
    messages.push('PDF.js indisponible — ' + error.message);
  }
  if (checkMammoth()) messages.push('Mammoth OK — 1.12.2');
  else messages.push('Mammoth indisponible — exécutez setup-vendor.ps1');
  $('dependencyStatus').textContent = messages.join(' | ');
  setStatus('Vérification terminée.');
}

function normalizeBlockText(text) {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t\u00a0]+/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

function textItemsToLines(items) {
  const textItems = (items || []).filter(item => item && typeof item.str === 'string');
  const lines = [];
  let current = '';
  let lastY = null;
  let lastEndX = null;
  let lastHeight = 10;

  for (const item of textItems) {
    if (!item || typeof item.str !== 'string') continue;
    const x = Array.isArray(item.transform) ? item.transform[4] : null;
    const y = Array.isArray(item.transform) ? item.transform[5] : null;
    const height = Math.abs(item.height || (Array.isArray(item.transform) ? item.transform[3] : 10) || 10);

    const newVisualLine = lastY !== null && y !== null && Math.abs(y - lastY) > Math.max(2, lastHeight * 0.55);
    if (newVisualLine && current.trim()) {
      lines.push(current.trimEnd());
      current = '';
      lastEndX = null;
    }

    if (current && item.str) {
      let needsSpace = false;
      if (x !== null && lastEndX !== null) {
        const gap = x - lastEndX;
        needsSpace = gap > Math.max(1, height * 0.12);
      } else {
        needsSpace = !/\s$/.test(current) && !/^[,.;:!?%)\]}]/.test(item.str);
      }
      if (needsSpace && !/^\s/.test(item.str)) current += ' ';
    }

    current += item.str;

    if (x !== null && typeof item.width === 'number') lastEndX = x + item.width;
    lastY = y;
    lastHeight = height;

    if (item.hasEOL) {
      if (current.trim()) lines.push(current.trimEnd());
      current = '';
      lastEndX = null;
      lastY = null;
    }
  }
  if (current.trim()) lines.push(current.trimEnd());
  let rebuilt = normalizeBlockText(lines.join('\n'));
  if (!rebuilt && textItems.length) {
    rebuilt = normalizeBlockText(textItems.map(item => item.str).join(' '));
  }
  return rebuilt;
}

async function extractPdf(source, file) {
  const lib = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = lib.getDocument({
    data,
    enableScripting: false,
    isEvalSupported: false,
    useWorkerFetch: false
  });
  const pdf = await loadingTask.promise;
  source.pageCount = pdf.numPages;
  const blocks = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    $('extractionStatus').textContent = source.fileName + ' — page ' + pageNumber + '/' + pdf.numPages;
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent({
      includeMarkedContent: false,
      disableNormalization: false
    });
    const rawTextItems = (content.items || []).filter(item => item && typeof item.str === 'string');
    const text = textItemsToLines(content.items);
    if (!text && rawTextItems.length === 0) {
      source.extractionMessages.push('Page ' + pageNumber + ' : aucune couche texte extractible.');
    } else if (!text && rawTextItems.length) {
      source.extractionMessages.push('Page ' + pageNumber + ' : éléments texte détectés mais reconstruction vide.');
    }
    blocks.push({
      blockId: source.assetId + '-P' + String(pageNumber).padStart(4, '0'),
      sourceId: source.assetId,
      sequence: pageNumber,
      pageRef: pageNumber,
      label: 'Page ' + pageNumber,
      text,
      originalTextHash: await sha256Text(text),
      modified: false
    });
    page.cleanup();
  }
  await pdf.destroy();
  const nonEmpty = blocks.filter(block => block.text.trim()).length;
  source.extractionMessages.push('PDF : ' + nonEmpty + '/' + blocks.length + ' page(s) avec texte extractible.');
  if (!nonEmpty) {
    throw new Error('PDF ouvert, mais aucune couche texte exploitable n’a été extraite. Vérifiez qu’il s’agit bien d’un PDF de transcription avec texte sélectionnable ; sinon utilisez le DOCX ou une extraction/OCR locale séparée.');
  }
  return blocks;
}

async function extractDocx(source, file) {
  if (!checkMammoth()) throw new Error('Mammoth local absent. Exécutez setup-vendor.ps1.');
  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  source.extractionMessages = (result.messages || []).map(m => (m.type || 'info') + ': ' + m.message);

  const raw = String(result.value || '').replace(/\r\n?/g, '\n').trim();
  const paragraphs = raw.split(/\n{2,}/).map(normalizeBlockText).filter(Boolean);
  if (!paragraphs.length && raw) paragraphs.push(normalizeBlockText(raw));

  return Promise.all(paragraphs.map(async (text, index) => ({
    blockId: source.assetId + '-B' + String(index + 1).padStart(4, '0'),
    sourceId: source.assetId,
    sequence: index + 1,
    pageRef: null,
    label: 'Paragraphe ' + (index + 1),
    text,
    originalTextHash: await sha256Text(text),
    modified: false
  })));
}

async function extractPlainText(source, file) {
  const raw = String(await file.text()).replace(/\r\n?/g, '\n').trim();
  const parts = raw.split(/\n{2,}/).map(normalizeBlockText).filter(Boolean);
  if (!parts.length && raw) parts.push(normalizeBlockText(raw));
  return Promise.all(parts.map(async (text, index) => ({
    blockId: source.assetId + '-B' + String(index + 1).padStart(4, '0'),
    sourceId: source.assetId,
    sequence: index + 1,
    pageRef: null,
    label: 'Bloc ' + (index + 1),
    text,
    originalTextHash: await sha256Text(text),
    modified: false
  })));
}

async function extractAll() {
  const transcriptionSources = state.sources.filter(s => s.kind === 'transcription');
  if (!transcriptionSources.length) {
    alert('Ajoutez d’abord au moins une transcription.');
    return;
  }

  const newBlocks = [];
  $('extractionStatus').textContent = 'Extraction en cours…';

  for (const source of transcriptionSources) {
    const file = filesById.get(source.assetId);
    if (!file) {
      source.extractionMessages.push('Fichier binaire non disponible dans cette session ; réimportez la source pour la réextraire.');
      continue;
    }

    try {
      setStatus('Extraction de ' + source.fileName + '…');
      let blocks = [];
      if (source.sourceType === 'pdf') blocks = await extractPdf(source, file);
      else if (source.sourceType === 'docx') blocks = await extractDocx(source, file);
      else if (source.sourceType === 'txt' || source.sourceType === 'md') blocks = await extractPlainText(source, file);
      else throw new Error('Type non extractible : ' + source.sourceType);

      source.extractedAt = nowIso();
      newBlocks.push(...blocks);
      state.transformations.push({
        at: nowIso(),
        type: 'extract',
        sourceId: source.assetId,
        sourceType: source.sourceType,
        blocks: blocks.length
      });
    } catch (error) {
      source.extractionMessages.push('Extraction échouée : ' + error.message);
      $('extractionStatus').textContent = 'ERREUR ' + source.fileName + ' : ' + error.message;
    }
  }

  state.blocks = newBlocks;
  state.sourceRevision += 1;
  state.segmentationRevision = null;
  state.entries = [];
  state.selectedBlockId = state.blocks[0]?.blockId || null;
  $('extractionStatus').textContent = state.blocks.length + ' bloc(s) extrait(s).';
  renderSources();
  renderBlocks();
  setStatus('Extraction terminée.');
}

function renderBlocks() {
  const box = $('blockList');
  box.innerHTML = '';
  if (!state.blocks.length) {
    box.className = 'card-list empty';
    box.textContent = 'Aucun texte extrait.';
    $('blockEditor').value = '';
    $('blockEditor').disabled = true;
    $('saveBlock').disabled = true;
    $('blockMeta').textContent = 'Sélectionnez un bloc.';
    return;
  }
  box.className = 'card-list';

  state.blocks.forEach(block => {
    const source = state.sources.find(s => s.assetId === block.sourceId);
    const card = document.createElement('div');
    card.className = 'block-card' + (block.blockId === state.selectedBlockId ? ' active' : '');
    const head = document.createElement('div');
    head.className = 'block-head';
    const label = document.createElement('strong');
    label.textContent = block.label;
    const small = document.createElement('span');
    small.className = 'small';
    small.textContent = (source?.fileName || block.sourceId) + (block.modified ? ' · modifié' : '');
    head.append(label, small);
    const preview = document.createElement('div');
    preview.className = 'small';
    preview.style.marginTop = '5px';
    preview.textContent = block.text.slice(0, 160).replace(/\s+/g, ' ') + (block.text.length > 160 ? '…' : '');
    card.append(head, preview);
    card.addEventListener('click', () => selectBlock(block.blockId));
    box.appendChild(card);
  });

  const selected = state.blocks.find(b => b.blockId === state.selectedBlockId) || state.blocks[0];
  if (selected) selectBlock(selected.blockId, false);
}

function selectBlock(blockId, rerender = true) {
  state.selectedBlockId = blockId;
  const block = state.blocks.find(b => b.blockId === blockId);
  if (!block) return;
  const source = state.sources.find(s => s.assetId === block.sourceId);
  $('blockMeta').textContent = [source?.fileName, block.label, block.originalTextHash ? 'origine ' + block.originalTextHash.slice(0, 12) + '…' : ''].filter(Boolean).join(' · ');
  $('blockEditor').disabled = false;
  $('blockEditor').value = block.text;
  $('saveBlock').disabled = false;
  if (rerender) renderBlocks();
}

async function saveBlockCorrection() {
  const block = state.blocks.find(b => b.blockId === state.selectedBlockId);
  if (!block) return;
  const beforeHash = await sha256Text(block.text);
  const next = normalizeBlockText($('blockEditor').value);
  const afterHash = await sha256Text(next);
  if (beforeHash === afterHash) {
    setStatus('Aucune modification du bloc.');
    return;
  }
  block.text = next;
  block.modified = true;
  state.sourceRevision += 1;
  state.transformations.push({
    at: nowIso(),
    type: 'manual-block-edit',
    blockId: block.blockId,
    beforeHash,
    afterHash
  });
  renderBlocks();
  updateSegmentationNotice();
  if (segmentationIsStale()) {
    setStatus('Correction appliquée. La segmentation existante est maintenant à reconstruire avant export.');
  } else {
    setStatus('Correction appliquée à la copie de travail.');
  }
}

function buildComposite() {
  let text = '';
  const ranges = [];
  state.blocks.forEach((block, index) => {
    if (index) text += '\n\n';
    const start = text.length;
    text += block.text;
    const end = text.length;
    ranges.push({
      start,
      end,
      sourceId: block.sourceId,
      pageRef: block.pageRef,
      blockId: block.blockId
    });
  });
  return { text, ranges };
}

function entryRefsForRange(ranges, start, end) {
  const overlapping = ranges.filter(r => r.start < end && r.end > start);
  return {
    pageRefs: unique(overlapping.map(r => r.pageRef)).sort((a, b) => a - b),
    assetRefs: unique(overlapping.map(r => r.sourceId))
  };
}

function createEntry(text, index, refs, suggestedLabel = null, suggestedDate = null) {
  return {
    internalId: crypto.randomUUID ? crypto.randomUUID() : 'E-' + Date.now() + '-' + Math.random(),
    entryId: 'ENTREE-' + String(index + 1).padStart(4, '0'),
    date: suggestedDate,
    datePrecision: suggestedDate ? 'exact' : 'unknown',
    sourceLabel: suggestedLabel || ('Entrée ' + (index + 1)),
    pageRefs: refs.pageRefs || [],
    assetRefs: refs.assetRefs || [],
    text: normalizeBlockText(text),
    textHash: null,
    modified: false
  };
}

function makeSingleEntry() {
  if (!state.blocks.length) {
    alert('Extrayez d’abord le texte.');
    return;
  }
  const composite = buildComposite();
  const refs = entryRefsForRange(composite.ranges, 0, composite.text.length);
  state.entries = [createEntry(composite.text, 0, refs, 'Entrée complète', null)];
  state.segmentationRevision = state.sourceRevision;
  state.transformations.push({ at: nowIso(), type: 'segment-single-entry', entries: 1, sourceRevision: state.sourceRevision });
  renderEntries();
  updateSegmentationNotice();
  setStatus('Segmentation manuelle initialisée depuis le texte corrigé. Scindez maintenant l’entrée au curseur.');
}

const frenchMonths = {
  janvier: '01', février: '02', fevrier: '02', mars: '03', avril: '04', mai: '05', juin: '06',
  juillet: '07', août: '08', aout: '08', septembre: '09', octobre: '10', novembre: '11',
  décembre: '12', decembre: '12'
};

function parseFrenchDate(line) {
  const normalized = line.toLocaleLowerCase('fr').normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const match = normalized.match(/(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)?\s*(\d{1,2})\s+(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)\s+(\d{4})\b/);
  if (!match) return null;
  const day = match[1].padStart(2, '0');
  const month = frenchMonths[match[2]] || frenchMonths[match[2].replace('é', 'e').replace('û', 'u')];
  return month ? match[3] + '-' + month + '-' + day : null;
}

function detectDateEntries() {
  if (!state.blocks.length) {
    alert('Extrayez d’abord le texte.');
    return;
  }

  let regex;
  try {
    const flags = 'gm' + ($('regexCaseInsensitive').checked ? 'i' : '');
    regex = new RegExp($('dateRegex').value, flags);
  } catch (error) {
    alert('Expression régulière invalide : ' + error.message);
    return;
  }

  const composite = buildComposite();
  const matches = [...composite.text.matchAll(regex)];
  if (!matches.length) {
    alert('Aucune date détectée. Vous pouvez créer une entrée unique puis la scinder manuellement.');
    return;
  }

  const boundaries = unique([0, ...matches.map(m => m.index)]).sort((a, b) => a - b);
  const entries = [];
  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i];
    const end = i + 1 < boundaries.length ? boundaries[i + 1] : composite.text.length;
    const raw = composite.text.slice(start, end).trim();
    if (!raw) continue;
    const line = raw.split('\n')[0].trim();
    const date = parseFrenchDate(line);
    const refs = entryRefsForRange(composite.ranges, start, end);
    entries.push(createEntry(raw, entries.length, refs, line.slice(0, 100), date));
  }

  state.entries = entries;
  state.segmentationRevision = state.sourceRevision;
  state.transformations.push({
    at: nowIso(),
    type: 'segment-date-regex',
    regex: $('dateRegex').value,
    caseInsensitive: $('regexCaseInsensitive').checked,
    matches: matches.length,
    entries: entries.length,
    sourceRevision: state.sourceRevision
  });
  renderEntries();
  updateSegmentationNotice();
  setStatus(entries.length + ' entrée(s) proposée(s).');
}

function renumberEntries() {
  state.entries.forEach((entry, index) => {
    entry.entryId = 'ENTREE-' + String(index + 1).padStart(4, '0');
  });
  renderEntries();
}

function splitEntry(index, cursor) {
  const entry = state.entries[index];
  if (!entry) return;
  const pos = Math.max(0, Math.min(entry.text.length, cursor));
  if (pos <= 0 || pos >= entry.text.length) {
    alert('Placez le curseur dans le texte à l’endroit de la coupure.');
    return;
  }
  const left = normalizeBlockText(entry.text.slice(0, pos));
  const right = normalizeBlockText(entry.text.slice(pos));
  if (!left || !right) return;

  const second = {
    ...entry,
    internalId: crypto.randomUUID ? crypto.randomUUID() : 'E-' + Date.now() + '-' + Math.random(),
    entryId: entry.entryId + '-B',
    sourceLabel: entry.sourceLabel + ' — suite',
    date: null,
    datePrecision: 'unknown',
    text: right,
    textHash: null,
    modified: true
  };
  entry.text = left;
  entry.textHash = null;
  entry.modified = true;
  state.entries.splice(index + 1, 0, second);
  state.transformations.push({ at: nowIso(), type: 'manual-split', entryId: entry.entryId, cursor: pos });
  renumberEntries();
  setStatus('Entrée scindée.');
}

function mergeWithNext(index) {
  if (index < 0 || index >= state.entries.length - 1) return;
  const a = state.entries[index];
  const b = state.entries[index + 1];
  a.text = normalizeBlockText(a.text + '\n\n' + b.text);
  a.pageRefs = unique([...a.pageRefs, ...b.pageRefs]).sort((x, y) => x - y);
  a.assetRefs = unique([...a.assetRefs, ...b.assetRefs]);
  a.textHash = null;
  a.modified = true;
  state.entries.splice(index + 1, 1);
  state.transformations.push({ at: nowIso(), type: 'manual-merge', keptEntryId: a.entryId, removedEntryId: b.entryId });
  renumberEntries();
  setStatus('Entrées fusionnées.');
}

function moveEntry(index, delta) {
  const target = index + delta;
  if (target < 0 || target >= state.entries.length) return;
  const [entry] = state.entries.splice(index, 1);
  state.entries.splice(target, 0, entry);
  state.transformations.push({ at: nowIso(), type: 'manual-reorder', entryId: entry.entryId, from: index, to: target });
  renderEntries();
}

function deleteEntry(index) {
  const entry = state.entries[index];
  if (!entry) return;
  if (!confirm('Supprimer ' + entry.entryId + ' de la copie de travail ?')) return;
  state.entries.splice(index, 1);
  state.transformations.push({ at: nowIso(), type: 'manual-delete-entry', entryId: entry.entryId });
  renumberEntries();
}

function renderEntries() {
  const box = $('entryList');
  box.innerHTML = '';
  if (!state.entries.length) {
    box.className = 'entry-list empty';
    box.textContent = 'Aucune entrée construite.';
    return;
  }
  box.className = 'entry-list';

  state.entries.forEach((entry, index) => {
    const card = document.createElement('div');
    card.className = 'entry-card';

    const head = document.createElement('div');
    head.className = 'entry-head';

    const idLabel = document.createElement('label');
    idLabel.textContent = 'ID';
    const idInput = document.createElement('input');
    idInput.value = entry.entryId;
    idInput.addEventListener('change', () => { entry.entryId = idInput.value.trim(); entry.textHash = null; });
    idLabel.appendChild(idInput);

    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Date';
    const dateInput = document.createElement('input');
    dateInput.type = 'text';
    dateInput.placeholder = 'AAAA-MM-JJ';
    dateInput.value = entry.date || '';
    dateInput.addEventListener('change', () => {
      entry.date = dateInput.value.trim() || null;
      entry.datePrecision = entry.date ? 'exact' : 'unknown';
    });
    dateLabel.appendChild(dateInput);

    const titleLabel = document.createElement('label');
    titleLabel.className = 'stretch';
    titleLabel.textContent = 'Libellé';
    const titleInput = document.createElement('input');
    titleInput.value = entry.sourceLabel || '';
    titleInput.addEventListener('change', () => { entry.sourceLabel = titleInput.value; });
    titleLabel.appendChild(titleInput);

    const pages = document.createElement('div');
    pages.className = 'small';
    pages.textContent = entry.pageRefs.length ? 'p. ' + entry.pageRefs.join(', ') : 'sans page';

    head.append(idLabel, dateLabel, titleLabel, pages);

    const refsLabel = document.createElement('label');
    refsLabel.style.display = 'block';
    refsLabel.style.marginTop = '7px';
    refsLabel.textContent = 'Assets liés (IDs séparés par des virgules)';
    const refsInput = document.createElement('input');
    refsInput.value = entry.assetRefs.join(', ');
    refsInput.addEventListener('change', () => {
      entry.assetRefs = unique(refsInput.value.split(',').map(x => x.trim()).filter(Boolean));
    });
    refsLabel.appendChild(refsInput);

    const textarea = document.createElement('textarea');
    textarea.className = 'entry-text';
    textarea.value = entry.text;
    textarea.addEventListener('input', () => {
      entry.text = textarea.value.replace(/\r\n?/g, '\n');
      entry.textHash = null;
      entry.modified = true;
    });

    const actions = document.createElement('div');
    actions.className = 'entry-actions';

    const split = document.createElement('button');
    split.textContent = 'Scinder au curseur';
    split.addEventListener('click', () => splitEntry(index, textarea.selectionStart));

    const merge = document.createElement('button');
    merge.textContent = 'Fusionner avec suivante';
    merge.disabled = index === state.entries.length - 1;
    merge.addEventListener('click', () => mergeWithNext(index));

    const up = document.createElement('button');
    up.textContent = '↑';
    up.disabled = index === 0;
    up.title = 'Monter';
    up.addEventListener('click', () => moveEntry(index, -1));

    const down = document.createElement('button');
    down.textContent = '↓';
    down.disabled = index === state.entries.length - 1;
    down.title = 'Descendre';
    down.addEventListener('click', () => moveEntry(index, 1));

    const del = document.createElement('button');
    del.textContent = 'Supprimer';
    del.className = 'danger';
    del.addEventListener('click', () => deleteEntry(index));

    actions.append(split, merge, up, down, del);

    const hashLine = document.createElement('div');
    hashLine.className = 'small';
    hashLine.style.marginTop = '6px';
    hashLine.textContent = entry.textHash ? 'SHA-256 ' + entry.textHash : 'hash à recalculer';

    card.append(head, refsLabel, textarea, actions, hashLine);
    box.appendChild(card);
  });
}

async function computeEntryHashes() {
  setStatus('Calcul des hashes des entrées…');
  for (const entry of state.entries) {
    entry.text = entry.text.replace(/\r\n?/g, '\n');
    entry.textHash = await sha256Text(entry.text);
  }
  renderEntries();
  setStatus('Hashes des entrées calculés.');
}

function validate() {
  const results = [];
  const push = (level, message) => results.push({ level, message });

  if (!$('corpusId').value.trim()) push('error', 'corpusId manquant.');
  else push('ok', 'corpusId renseigné.');

  if (!$('corpusVersion').value.trim()) push('error', 'Version du corpus manquante.');
  if (!$('documentId').value.trim()) push('error', 'documentId manquant.');

  const transcriptionSources = state.sources.filter(s => s.kind === 'transcription');
  if (!transcriptionSources.length) push('error', 'Aucune transcription source.');
  else push('ok', transcriptionSources.length + ' transcription(s) enregistrée(s).');
  if (transcriptionSources.length > 1) push('warn', 'Plusieurs transcriptions seront concaténées selon l’ordre d’import.');

  state.sources.forEach(source => {
    if (!source.sha256) push('warn', 'Hash source manquant : ' + source.fileName);
  });

  if (!state.blocks.length) push('warn', 'Aucun bloc extrait conservé.');
  if (!state.entries.length) push('error', 'Aucune entrée canonique.');
  else push('ok', state.entries.length + ' entrée(s) canonique(s).');
  if (segmentationIsStale()) push('error', 'La segmentation est obsolète par rapport aux dernières corrections des blocs. Reconstruisez-la avant export.');

  const ids = new Map();
  state.entries.forEach((entry, index) => {
    const label = entry.entryId || ('entrée #' + (index + 1));
    if (!entry.entryId) push('error', 'ID vide pour l’entrée #' + (index + 1));
    ids.set(entry.entryId, (ids.get(entry.entryId) || 0) + 1);
    if (!entry.text.trim()) push('error', label + ' : texte vide.');
    if (!entry.textHash) push('warn', label + ' : hash du texte non calculé.');
    if (entry.date && !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) push('warn', label + ' : date non ISO exacte (' + entry.date + ').');
    entry.assetRefs.forEach(id => {
      if (!state.sources.some(s => s.assetId === id)) push('warn', label + ' : asset inconnu ' + id + '.');
    });
  });
  for (const [id, count] of ids) {
    if (id && count > 1) push('error', 'ID d’entrée dupliqué : ' + id);
  }

  const modifiedBlocks = state.blocks.filter(b => b.modified).length;
  if (modifiedBlocks) push('warn', modifiedBlocks + ' bloc(s) extrait(s) ont été corrigé(s) manuellement.');
  const modifiedEntries = state.entries.filter(e => e.modified).length;
  if (modifiedEntries) push('ok', modifiedEntries + ' entrée(s) ont été ajustée(s) dans la copie canonique.');

  state.validation = results;
  renderValidation();
  return results;
}

function renderValidation() {
  const box = $('validationList');
  box.innerHTML = '';
  const counts = { ok: 0, warn: 0, error: 0 };
  state.validation.forEach(item => {
    counts[item.level]++;
    const div = document.createElement('div');
    div.className = 'validation-item ' + item.level;
    div.textContent = ({ ok: 'OK — ', warn: 'ATTENTION — ', error: 'ERREUR — ' })[item.level] + item.message;
    box.appendChild(div);
  });
  $('validationSummary').textContent = counts.error + ' erreur(s) · ' + counts.warn + ' avertissement(s) · ' + counts.ok + ' contrôle(s) OK';
}

function projectMetadata() {
  return {
    corpusId: $('corpusId').value.trim(),
    version: $('corpusVersion').value.trim(),
    title: $('corpusTitle').value.trim(),
    documentId: $('documentId').value.trim(),
    sourceUnitId: $('sourceUnitId').value.trim() || null,
    documentLabel: $('documentLabel').value.trim() || null
  };
}

function assetForExport(source) {
  return {
    assetId: source.assetId,
    kind: source.kind === 'image' ? 'image' : 'transcription',
    mediaType: source.mediaType,
    fileName: source.fileName,
    sha256: source.sha256,
    pageCount: source.pageCount || null
  };
}

function entryForExport(entry) {
  return {
    entryId: entry.entryId,
    date: entry.date || null,
    datePrecision: entry.datePrecision || 'unknown',
    sourceLabel: entry.sourceLabel || null,
    pageRefs: unique(entry.pageRefs).sort((a, b) => a - b),
    assetRefs: unique(entry.assetRefs).map(assetId => ({ assetId, pages: [], note: null })),
    text: entry.text.replace(/\r\n?/g, '\n'),
    textHash: entry.textHash
  };
}

async function buildCorpus() {
  await computeEntryHashes();
  const meta = projectMetadata();
  return {
    schemaVersion: '0.2.0',
    corpusId: meta.corpusId,
    version: meta.version,
    title: meta.title,
    createdAt: nowIso(),
    assets: state.sources.map(assetForExport),
    documents: [{
      documentId: meta.documentId,
      label: meta.documentLabel,
      sourceUnitId: meta.sourceUnitId,
      entries: state.entries.map(entryForExport)
    }]
  };
}

function buildReport() {
  const meta = projectMetadata();
  return {
    reportVersion: '0.1.0',
    generatedAt: nowIso(),
    corpusId: meta.corpusId,
    corpusVersion: meta.version,
    builder: {
      name: 'JournalLab Corpus Builder',
      branch: 'corpus-builder',
      pdfjs: state.dependencies.pdfjs,
      mammoth: state.dependencies.mammoth
    },
    security: {
      runtimeNetworkRequired: false,
      pdfScriptingEnabled: false,
      sourceBinariesEmbeddedInExport: false
    },
    sources: state.sources.map(s => ({
      assetId: s.assetId,
      kind: s.kind,
      sourceType: s.sourceType,
      mediaType: s.mediaType,
      fileName: s.fileName,
      bytes: s.size,
      sha256: s.sha256,
      pageCount: s.pageCount,
      importedAt: s.importedAt,
      extractedAt: s.extractedAt,
      messages: s.extractionMessages
    })),
    transformations: state.transformations,
    validation: state.validation,
    counts: {
      sources: state.sources.length,
      blocks: state.blocks.length,
      entries: state.entries.length,
      images: state.sources.filter(s => s.kind === 'image').length
    }
  };
}

function saveWorkState() {
  const snapshot = {
    stateVersion: '0.1.0',
    savedAt: nowIso(),
    project: projectMetadata(),
    sources: state.sources,
    blocks: state.blocks,
    entries: state.entries,
    transformations: state.transformations,
    validation: state.validation,
    sourceRevision: state.sourceRevision,
    segmentationRevision: state.segmentationRevision,
    note: 'Les fichiers binaires sources ne sont pas inclus. Réimportez-les uniquement si une nouvelle extraction est nécessaire.'
  };
  downloadJson(normalizeOutputName($('stateOutputName')?.value, 'corpus-builder-chantier.json'), snapshot);
}

async function loadWorkState(file) {
  const parsed = JSON.parse(await file.text());
  if (!parsed || parsed.stateVersion !== '0.1.0') throw new Error('Version de chantier non reconnue.');

  const p = parsed.project || {};
  $('corpusId').value = p.corpusId || '';
  $('corpusVersion').value = p.version || '';
  $('corpusTitle').value = p.title || '';
  $('documentId').value = p.documentId || '';
  $('sourceUnitId').value = p.sourceUnitId || '';
  $('documentLabel').value = p.documentLabel || '';

  clearSources();
  state.sources = Array.isArray(parsed.sources) ? parsed.sources : [];
  state.blocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];
  state.entries = Array.isArray(parsed.entries) ? parsed.entries : [];
  state.transformations = Array.isArray(parsed.transformations) ? parsed.transformations : [];
  state.validation = Array.isArray(parsed.validation) ? parsed.validation : [];
  state.sourceRevision = Number.isInteger(parsed.sourceRevision) ? parsed.sourceRevision : 0;
  state.segmentationRevision = Number.isInteger(parsed.segmentationRevision) ? parsed.segmentationRevision : (state.entries.length ? state.sourceRevision : null);
  state.selectedBlockId = state.blocks[0]?.blockId || null;

  renderSources();
  renderBlocks();
  renderEntries();
  renderValidation();
  updateSegmentationNotice();
  setStatus('Chantier repris. Les binaires source devront être réimportés pour toute nouvelle extraction.');
}

function activatePanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + name));
  document.querySelectorAll('.steps button').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
}

document.querySelectorAll('.steps button').forEach(button => {
  button.addEventListener('click', () => activatePanel(button.dataset.panel));
});

$('transcriptionFiles').addEventListener('change', event => addFiles(event.target.files, 'transcription'));
$('imageFiles').addEventListener('change', event => addFiles(event.target.files, 'image'));
$('clearSources').addEventListener('click', clearSources);
$('checkDependencies').addEventListener('click', checkDependencies);
$('extractAll').addEventListener('click', extractAll);
$('saveBlock').addEventListener('click', saveBlockCorrection);
$('makeSingleEntry').addEventListener('click', makeSingleEntry);
$('detectDates').addEventListener('click', detectDateEntries);
$('renumberEntries').addEventListener('click', renumberEntries);
$('runValidation').addEventListener('click', validate);
$('computeHashes').addEventListener('click', computeEntryHashes);
$('downloadState').addEventListener('click', saveWorkState);

$('loadState').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    await loadWorkState(file);
  } catch (error) {
    alert('Impossible de reprendre le chantier : ' + error.message);
  }
});

$('exportCorpus').addEventListener('click', async () => {
  const results = validate();
  if (results.some(r => r.level === 'error')) {
    alert('Corrigez les erreurs de validation avant l’export.');
    activatePanel('validate');
    return;
  }
  const corpus = await buildCorpus();
  const filename = normalizeOutputName($('corpusOutputName')?.value, 'corpus.json');
  downloadJson(filename, corpus);
  setStatus(filename + ' généré localement.');
});

$('exportReport').addEventListener('click', () => {
  validate();
  const filename = normalizeOutputName($('reportOutputName')?.value, 'build-report.json');
  downloadJson(filename, buildReport());
  setStatus(filename + ' généré localement.');
});

window.addEventListener('beforeunload', () => {
  for (const url of previewUrls.values()) URL.revokeObjectURL(url);
});

renderSources();
renderBlocks();
renderEntries();
renderValidation();
updateSegmentationNotice();
checkDependencies().catch(() => {});
