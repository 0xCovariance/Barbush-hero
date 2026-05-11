export function StarRating({ value = 0, size = 'sm' }) {
  const px = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm';
  return (
    <div className={`inline-flex gap-0.5 ${px}`} aria-label={`${value} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < value ? 'text-amber-400' : 'text-ink-500'}>
          ★
        </span>
      ))}
    </div>
  );
}
