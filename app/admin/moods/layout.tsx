/**
 * Override the default admin card for the moods page —
 * near-transparent so you can actually see the atmosphere you're editing.
 */
export default function MoodsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-m-6 md:-m-10 p-6 md:p-10 min-h-[calc(100vh-8rem)] rounded-xl bg-background/5">
      {children}
    </div>
  )
}
