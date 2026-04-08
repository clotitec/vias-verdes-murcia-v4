'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Mapa', icon: MapIcon },
    { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-1"
      style={{
        background: 'rgba(244, 243, 238, 0.75)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderBottom: '1px solid rgba(201, 212, 196, 0.3)',
      }}
    >
      <Link href="/" className="flex items-center gap-2 mr-6">
        <img src="/images/logo-vv-murcia.webp" alt="VV Murcia" className="h-8 w-8 rounded-lg object-contain" />
        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
          Vias Verdes
        </span>
      </Link>

      <div className="flex gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                active
                  ? 'bg-white/80 shadow-sm'
                  : 'hover:bg-white/40'
              }`}
              style={{ color: active ? 'var(--murcia-primary)' : 'var(--text-secondary)' }}
            >
              <Icon size={14} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MapIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
      <path d="M8 2v16m8-12v16" />
    </svg>
  );
}

function DashboardIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="4" rx="1" />
      <rect x="14" y="10" width="7" height="11" rx="1" />
      <rect x="3" y="13" width="7" height="8" rx="1" />
    </svg>
  );
}
