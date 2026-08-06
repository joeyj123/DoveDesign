import { useEffect, useRef, useState } from 'react';

/**
 * Data Flow Pipeline: Editable Label (New Order 5.1)
 *
 * INPUT: `value` — a plain string field already owned by the caller's store
 *   record (e.g. WoodMember.label). Never geometry, never a Face/Solid
 *   reference — pure metadata.
 *
 * CALCULATION: none. Typed text is trimmed on commit; an empty result
 *   reverts to the previous value instead of writing a blank label.
 *
 * OUTPUT: onCommit(trimmedText) — the caller decides how to persist it
 *   (BoardEditPanel and the Entities row both call updateMember(id, { label })).
 *   This component never touches the store directly, so it stays reusable
 *   for any future renameable entity.
 *
 * FOLLOWS-BOARD CHECK: n/a — text metadata, not board geometry/placement.
 */
export default function EditableLabel({
  value,
  onCommit,
  className,
  inputClassName,
  showEditIcon,
}: {
  value: string;
  onCommit: (value: string) => void;
  className?: string;
  inputClassName?: string;
  showEditIcon?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setText(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commit() {
    const trimmed = text.trim();
    setEditing(false);
    if (trimmed && trimmed !== value) {
      onCommit(trimmed);
    } else {
      setText(value);
    }
  }

  function cancel() {
    setText(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          else if (e.key === 'Escape') cancel();
        }}
        onClick={(e) => e.stopPropagation()}
        className={inputClassName ?? 'bg-charcoal-800 border border-orange-500 rounded px-1 text-white'}
      />
    );
  }

  return (
    <span className="group/label inline-flex items-center gap-1 min-w-0">
      <span
        className={`${className ?? ''} cursor-text truncate`}
        title="Click to rename"
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
      >
        {value}
      </span>
      {showEditIcon && (
        <button
          type="button"
          title="Rename"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          className="opacity-0 group-hover/label:opacity-100 text-charcoal-400 hover:text-white shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M4 20l1-4.2L15.8 5 19 8.2 8.2 19 4 20z" />
          </svg>
        </button>
      )}
    </span>
  );
}
