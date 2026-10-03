import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Hanzi Journey home">
      <span className="grid size-10 place-items-center rounded-xl bg-primary text-xl font-semibold text-primary-foreground shadow-sm">
        汉
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[15px] font-bold tracking-tight">Hanzi Journey</span>
          <span className="block text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">汉字旅程</span>
        </span>
      )}
    </Link>
  );
}
