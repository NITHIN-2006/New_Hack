import { ArrowUpRight, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';

interface TopNavbarProps {
  adminEmail: string;
  dataSource: 'FIREBASE' | 'ENDPOINT' | 'DEMO_MODE';
  loading: boolean;
  onSync: () => Promise<void> | void;
  onLogout: () => void;
}

export default function TopNavbar({
  adminEmail,
  dataSource,
  loading,
  onSync,
  onLogout,
}: TopNavbarProps) {
  return (
    <header className="border-b border-[#E2E8F0] bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16A34A] text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-tight text-[#172033]">AIDO Admin Console</div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
              people for people
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#64748B]">
            {dataSource}
          </div>
          <span className="text-sm font-medium text-[#172033]">{adminEmail}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onSync()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-[#172033] transition hover:border-[#16A34A] hover:text-[#16A34A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing' : 'Sync'}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-[#172033] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0f172a]"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 pb-4 md:hidden">
        <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#64748B]">
          <span>Source</span>
          <span className="inline-flex items-center gap-1 text-[#16A34A]">
            {dataSource}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </header>
  );
}
