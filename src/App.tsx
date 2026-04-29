import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import PredictionsPage from "./pages/PredictionsPage";
import TrendsPage from "./pages/TrendsPage";
import AboutPage from "./pages/AboutPage";
import type { NavItem } from "./types";

const navItems: NavItem[] = [
  { label: "Home", path: "/home" },
  { label: "Predictions", path: "/predictions" },
  { label: "Trends", path: "/trends" },
  { label: "About", path: "/about" }
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const animatedContainer = useMemo(
    () => ({
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35 }
    }),
    []
  );

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-8 h-56 w-56 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-200/60 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-lime-100/60 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:34px_34px]" />
      </div>
      <Sidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="relative z-10 w-full flex-1 p-4 lg:p-6">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <motion.div className="mt-4" {...animatedContainer}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="/trends" element={<TrendsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </motion.div>
      </main>
    </div>
  );
}

