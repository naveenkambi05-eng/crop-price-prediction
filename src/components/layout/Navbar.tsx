type NavbarProps = {
  onMenuClick: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 p-4 shadow-soft backdrop-blur-sm">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium lg:hidden"
      >
        Menu
      </button>
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Market Price Dashboard</h2>
        <p className="text-sm text-slate-500">AI-assisted insights for smarter crop selling</p>
      </div>
      <div className="hidden rounded-full bg-gradient-to-r from-brand-50 to-emerald-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100 md:block">
        Live market intelligence
      </div>
    </header>
  );
}

