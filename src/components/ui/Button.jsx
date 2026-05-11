export function Button({ variant = 'primary', children, className = '', ...rest }) {
  const cls = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  }[variant] || 'btn-primary';
  return (
    <button className={`${cls} ${className}`} {...rest}>
      {children}
    </button>
  );
}
