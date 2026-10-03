type SectionTitleProps = {
  children: string;
  id?: string;
  action?: { label: string; onClick: () => void };
};

export function SectionTitle({ children, id, action }: SectionTitleProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 id={id} className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">{children}</h2>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
      {action && <button type="button" onClick={action.onClick} className="text-xs font-semibold text-primary transition duration-200 hover:underline">{action.label}</button>}
    </div>
  );
}
