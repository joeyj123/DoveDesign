interface AccordionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function Accordion({ title, open, onToggle, children }: AccordionProps) {
  return (
    <div className="border-b border-zinc-800/80">
      <button
        type="button"
        onClick={onToggle}
        className={[
          'w-full flex items-center justify-between px-4 py-3 text-base font-semibold',
          'text-zinc-100 hover:bg-zinc-800/50 transition-colors',
          open ? 'bg-zinc-800/30' : '',
        ].join(' ')}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="text-zinc-400 text-sm">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
