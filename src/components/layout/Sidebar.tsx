import { Link, useLocation } from "react-router-dom";
import type { NavItem } from "../../types";

type SidebarProps = {
  navItems: NavItem[];
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ navItems, isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/40 bg-gradient-to-b from-white/90 via-white/80 to-brand-50/60 p-5 shadow-soft backdrop-blur transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8">
          <h1 className="text-xl font-bold text-brand-700">Farmer Forecast</h1>
          <p className="text-sm text-slate-500">Grow smart. Sell smarter.</p>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`block rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-100 text-brand-700 ring-1 ring-brand-200"
                    : "text-slate-600 hover:bg-white hover:text-slate-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/35 lg:hidden"
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
}

