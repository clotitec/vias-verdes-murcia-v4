import Link from 'next/link';

interface GlassButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  href?: string;
}

export default function GlassButton({
  variant = 'primary',
  children,
  onClick,
  className = '',
  disabled = false,
  href,
}: GlassButtonProps) {
  const cls = `${variant === 'primary' ? 'btn-glass-primary' : 'btn-glass-secondary'} px-4 py-2.5 rounded-xl text-sm font-medium ${className}`;

  if (href) {
    return <Link href={href} className={cls}>{children}</Link>;
  }

  return (
    <button className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
