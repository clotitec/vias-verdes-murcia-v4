interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: boolean;
}

export default function GlassCard({ children, className = '', onClick, padding = true }: GlassCardProps) {
  return (
    <div
      className={`liquid-glass rounded-2xl ${padding ? 'p-5' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
