export function Card({ children, className = '', tight = false }) {
  return <div className={`${tight ? 'card-tight' : 'card'} ${className}`}>{children}</div>;
}
