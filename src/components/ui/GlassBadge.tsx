interface GlassBadgeProps {
  variant?: 'easy' | 'medium' | 'moderate' | 'operational' | 'coming_soon' | 'default';
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<string, string> = {
  easy: 'badge-easy',
  medium: 'badge-medium',
  moderate: 'badge-moderate',
  operational: 'badge-operational',
  coming_soon: 'badge-coming-soon',
  default: '',
};

export default function GlassBadge({ variant = 'default', children, className = '' }: GlassBadgeProps) {
  return (
    <span className={`${VARIANT_CLASSES[variant] || ''} text-xs px-2.5 py-1 rounded-full font-medium ${className}`}>
      {children}
    </span>
  );
}
