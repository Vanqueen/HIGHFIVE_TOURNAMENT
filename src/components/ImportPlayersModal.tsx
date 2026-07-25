import { useRef, useState } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';
import { api } from '../lib/api';
import { GOLD, INK, RULE } from './Scoreboard';
import ExcelJS from 'exceljs';

interface ImportRow {
  name: string;
  email?: string;
  club?: string;
  rating?: number;
}

type Step = 'upload' | 'preview' | 'result';

interface ImportReport {
  created: number;
  linked: number;
  anonymous: number;
  skipped: number;
  errors: { row: number; name?: string; reason: string }[];
}

/* ------------------------------------------------------------------ */
/*  Détection d'encodage                                               */
/* ------------------------------------------------------------------ */

/**
 * Détecte l'encodage du buffer et retourne une string décodée.
 * Priorité : BOM UTF-8 → UTF-8 valide → windows-1252 (fallback Excel/FR)
 */
function decodeBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  // BOM UTF-8 : EF BB BF
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(buffer.slice(3));
  }

  // Tenter UTF-8 strict
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    return text;
  } catch {
    // Fallback windows-1252 (encodage par défaut d'Excel en France)
    return new TextDecoder('windows-1252').decode(buffer);
  }
}

/* ------------------------------------------------------------------ */
/*  Parseurs                                                            */
/* ------------------------------------------------------------------ */

function parseCSV(text: string): ImportRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

  return lines.slice(1).map((line) => {
    const values = line.split(/[,;]/).map((v) => v.trim().replace(/^["']|["']$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
    return {
      name: row.name ?? row.nom ?? row['full_name'] ?? row['nom complet'] ?? '',
      email: row.email ?? row['e-mail'] ?? '',
      club: row.club ?? '',
      rating: Number(row.rating ?? row.elo ?? row.classement ?? 0) || 0,
    };
  });
}

function parseJSON(text: string): ImportRow[] {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.players ?? data.joueurs ?? [];
  return arr.map((r: Record<string, unknown>) => ({
    name: String(r.name ?? r.nom ?? r.full_name ?? '').trim(),
    email: String(r.email ?? '').trim().toLowerCase() || undefined,
    club: String(r.club ?? '').trim() || undefined,
    rating: Number(r.rating ?? r.elo ?? r.classement ?? 0) || 0,
  }));
}

/* ------------------------------------------------------------------ */
/*  Composant                                                           */
/* ------------------------------------------------------------------ */

export function ImportPlayersModal({
  tournamentId,
  onClose,
  onImported,
}: {
  tournamentId: string;
  onClose: () => void;
  onImported: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);

  const handleFile = (file: File) => {
    setParseError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const text = decodeBuffer(buffer);
      try {
        const parsed = file.name.endsWith('.json') ? parseJSON(text) : parseCSV(text);
        if (parsed.length === 0) {
          setParseError('Aucun joueur trouvé dans le fichier. Vérifiez le format.');
          return;
        }
        setRows(parsed);
        setStep('preview');
      } catch {
        setParseError("Impossible de lire le fichier. Vérifiez qu'il est bien formaté.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const result = await api.players.bulkImport(tournamentId, rows);
      setReport(result);
      setStep('result');
      onImported();
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Erreur lors de l\'import.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async (format: 'xlsx' | 'csv' | 'json') => {
    const players = [
      { name: 'John Doe',  email: 'john.doe@exemple.com',  club: 'john doe club',    rating: 1000 }
    
    ];

    if (format === 'xlsx') {
      const wb = new ExcelJS.Workbook();
      wb.creator = 'HIGHFIVE TOURNAMENT';
      wb.created = new Date();

      const ws = wb.addWorksheet('Joueurs', {
        views: [{ state: 'frozen', ySplit: 3 }],
      });

      ws.columns = [
        { key: 'name',   width: 28 },
        { key: 'email',  width: 34 },
        { key: 'club',   width: 28 },
        { key: 'rating', width: 14 },
      ];

      // Ligne 1 : titre
      ws.mergeCells('A1:D1');
      const titleCell = ws.getCell('A1');
      titleCell.value = '♞  HIGHFIVE TOURNAMENT — Modèle d’import joueurs';
      titleCell.font      = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF111114' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      ws.getRow(1).height = 36;

      // Ligne 2 : sous-titre
      ws.mergeCells('A2:D2');
      const subCell = ws.getCell('A2');
      subCell.value     = 'Colonnes obligatoires : name, rating • Optionnelles : email, club • Remplissez à partir de la ligne 4';
      subCell.font      = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FFC6963B' } };
      subCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1C1C20' } };
      subCell.alignment = { vertical: 'middle', horizontal: 'center' };
      ws.getRow(2).height = 20;

      // Ligne 3 : en-têtes
      const headers = ['NOM COMPLET', 'EMAIL', 'CLUB', 'ELO / CLASSEMENT'];
      headers.forEach((label, i) => {
        const cell = ws.getCell(3, i + 1);
        cell.value     = label;
        cell.font      = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6963B' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border    = { bottom: { style: 'medium', color: { argb: 'FFA87A2C' } } };
      });
      ws.getRow(3).height = 24;

      // Lignes de données
      players.forEach((p, i) => {
        const row = ws.addRow([p.name, p.email, p.club, p.rating]);
        row.height = 20;
        const bgArgb = i % 2 === 0 ? 'FFFAFAF8' : 'FFFFFFFF';
        row.eachCell({ includeEmpty: true }, (cell, colNum) => {
          cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
          cell.font      = { name: 'Calibri', size: 10, color: { argb: 'FF111114' } };
          cell.border    = { bottom: { style: 'thin', color: { argb: 'FFE5E5E5' } }, right: { style: 'thin', color: { argb: 'FFE5E5E5' } } };
          cell.alignment = { vertical: 'middle', horizontal: colNum === 4 ? 'center' : 'left' };
          if (colNum === 4 && p.rating) {
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFA87A2C' } };
          }
        });
      });

      // Feuille guide
      const guide = wb.addWorksheet('📖 Guide');
      guide.columns = [{ width: 22 }, { width: 58 }];
      const guideRows: [string, string][] = [
        ['Champ',             'Description'],
        ['name',              'Nom complet du joueur. Obligatoire.'],
        ['email',             'Email. Optionnel. Lie le joueur à un compte ou en crée un.'],
        ['club',              'Nom du club. Optionnel.'],
        ['rating',            'Classement Elo. Obligatoire. Entier (ex : 1500). Mettre 0 si non classé.'],
        ['', ''],
        ['Formats acceptés', '.xlsx (ce fichier), .csv, .json'],
        ['Séparateur CSV',   'Virgule (,) ou point-virgule (;)'],
      ];
      guideRows.forEach(([a, b], i) => {
        const row = guide.addRow([a, b]);
        row.height = 20;
        if (i === 0) {
          row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          (row as ExcelJS.Row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF111114' } } as ExcelJS.FillPattern;
        } else if (a) {
          row.getCell(1).font = { bold: true, color: { argb: 'FFA87A2C' } };
        }
        row.eachCell({ includeEmpty: true }, (cell) => { cell.alignment = { vertical: 'middle' }; });
      });

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'modele-joueurs-highfive.xlsx';
      a.click();
      URL.revokeObjectURL(a.href);
      return;
    }

    // CSV / JSON
    let content: string;
    let mime: string;
    if (format === 'csv') {
      const BOM = '\uFEFF';
      const header = 'name,email,club,rating';
      const csvRows = players.map(p =>
        [p.name, p.email, p.club, p.rating].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
      );
      content = BOM + [header, ...csvRows].join('\r\n');
      mime = 'text/csv;charset=utf-8';
    } else {
      content = JSON.stringify(players.map(({ name, email, club, rating }) => ({
        name, ...(email ? { email } : {}), ...(club ? { club } : {}), rating,
      })), null, 2);
      mime = 'application/json';
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = `modele-joueurs.${format}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex w-full max-w-2xl flex-col rounded-2xl bg-white dark:bg-[#1e1535] shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 dark:border-white/10 px-6 py-4">
          <Upload className="h-5 w-5 shrink-0" style={{ color: GOLD }} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Import en masse</p>
            <p className="font-bold text-gray-800 dark:text-white">Importer des joueurs</p>
          </div>
          <button onClick={onClose} className="ml-auto rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {/* ÉTAPE 1 : Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Importez un fichier <strong>CSV</strong> ou <strong>JSON</strong> contenant la liste des joueurs.
                Les colonnes reconnues sont : <code className="rounded bg-gray-100 dark:bg-white/10 px-1 text-xs">name</code>,{' '}
                <code className="rounded bg-gray-100 dark:bg-white/10 px-1 text-xs">email</code>,{' '}
                <code className="rounded bg-gray-100 dark:bg-white/10 px-1 text-xs">club</code>,{' '}
                <code className="rounded bg-gray-100 dark:bg-white/10 px-1 text-xs">rating</code>.
              </p>

              {/* Zone de drop */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/20 px-6 py-10 transition-colors hover:border-gray-400 dark:hover:border-white/40"
              >
                <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Glissez un fichier ici ou <span className="underline" style={{ color: GOLD }}>parcourir</span>
                </p>
                <p className="text-xs text-gray-400">.xlsx, .csv ou .json</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.json,.xlsx"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>

              {parseError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {parseError}
                </div>
              )}

              {/* Télécharger un modèle */}
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-white/10 px-4 py-3">
                <Download className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Télécharger un modèle :</span>
                <button onClick={() => downloadTemplate('xlsx')} className="text-sm font-semibold underline" style={{ color: GOLD }}>Excel</button>
                <span className="text-gray-300">·</span>
                <button onClick={() => downloadTemplate('csv')} className="text-sm font-semibold underline" style={{ color: GOLD }}>CSV</button>
                <span className="text-gray-300">·</span>
                <button onClick={() => downloadTemplate('json')} className="text-sm font-semibold underline" style={{ color: GOLD }}>JSON</button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : Prévisualisation */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong className="text-gray-800 dark:text-white">{rows.length} joueur{rows.length > 1 ? 's' : ''}</strong> détecté{rows.length > 1 ? 's' : ''} dans <span className="font-mono text-xs">{fileName}</span>
                </p>
                <button onClick={() => { setStep('upload'); setRows([]); }} className="text-xs text-gray-400 underline hover:text-gray-600">
                  Changer de fichier
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border dark:border-white/10" style={{ borderColor: RULE }}>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-white/5">
                      {['#', 'Nom', 'Email', 'Club', 'Elo'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className={`border-t dark:border-white/5 ${i % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-gray-50 dark:bg-white/[0.03]'}`} style={{ borderColor: RULE }}>
                        <td className="px-3 py-2 font-mono text-xs text-gray-400">{i + 1}</td>
                        <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-100">{r.name || <span className="text-red-400">—</span>}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs">{r.email || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.club || '—'}</td>
                        <td className="px-3 py-2 font-mono text-gray-500 dark:text-gray-400">{r.rating || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                Les joueurs avec un email recevront un mot de passe temporaire si aucun compte n'existe encore.
              </div>

              {parseError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {parseError}
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 3 : Résultat */}
          {step === 'result' && report && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 shrink-0" style={{ color: GOLD }} />
                <p className="font-bold text-gray-800 dark:text-white">Import terminé</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Comptes créés', value: report.created, color: '#16a34a' },
                  { label: 'Comptes liés', value: report.linked, color: GOLD },
                  { label: 'Sans compte', value: report.anonymous, color: '#6b7280' },
                  { label: 'Ignorés', value: report.skipped, color: '#9ca3af' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl border dark:border-white/10 px-4 py-3 text-center" style={{ borderColor: RULE }}>
                    <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  </div>
                ))}
              </div>

              {report.errors.length > 0 && (
                <div className="rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 px-4 py-3">
                  <p className="mb-2 text-sm font-semibold text-red-700 dark:text-red-400">{report.errors.length} erreur{report.errors.length > 1 ? 's' : ''}</p>
                  <ul className="space-y-1">
                    {report.errors.map((e, i) => (
                      <li key={i} className="text-xs text-red-600 dark:text-red-400">
                        Ligne {e.row}{e.name ? ` (${e.name})` : ''} — {e.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 dark:border-white/10 px-6 py-4">
          {step === 'result' ? (
            <button
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: INK }}
            >
              Fermer
            </button>
          ) : (
            <>
              <button onClick={onClose} className="rounded-xl border border-gray-200 dark:border-white/10 px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                Annuler
              </button>
              {step === 'preview' && (
                <button
                  onClick={confirm}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: INK }}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Import en cours…' : `Importer ${rows.length} joueur${rows.length > 1 ? 's' : ''}`}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
