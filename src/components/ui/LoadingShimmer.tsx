interface LoadingShimmerProps {
  className?: string;
  width?: string;
  height?: string;
}

export default function LoadingShimmer({ className = '', width, height }: LoadingShimmerProps) {
  return (
    <div
      className={`rounded-xl animate-shimmer ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        background: 'rgba(90, 158, 143, 0.08)',
      }}
    />
  );
}
