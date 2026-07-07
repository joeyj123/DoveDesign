import { WOOD_SPECIES_LIST } from '../lib/materials';

/**
 * Shared species dropdown — the single UI for picking a WoodSpecies, used
 * identically by InsertPanel and the Sketch tool's material panel so the
 * species list and selection logic never diverge between the two tools
 * (CAD_MANIFESTO.md Law 3: one source of truth, not two lists that can
 * drift apart).
 */
export default function SpeciesSelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (species: string) => void;
  className?: string;
}) {
  return (
    <select
      value={WOOD_SPECIES_LIST.includes(value as (typeof WOOD_SPECIES_LIST)[number]) ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      className={
        className ??
        'w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-base text-white'
      }
    >
      {!WOOD_SPECIES_LIST.includes(value as (typeof WOOD_SPECIES_LIST)[number]) && (
        <option value="" disabled>
          {value || 'Select species'}
        </option>
      )}
      {WOOD_SPECIES_LIST.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
