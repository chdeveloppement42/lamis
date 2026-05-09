import './Skeleton.css';

export default function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = '0.25rem',
  variant = 'rect',
  size,
  className = '',
  style = {},
}) {
  const isCircle = variant === 'circle';

  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: isCircle ? (size || '2.5rem') : width,
        height: isCircle ? (size || '2.5rem') : height,
        borderRadius: isCircle ? '50%' : borderRadius,
        ...style,
      }}
    />
  );
}
