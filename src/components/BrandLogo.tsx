import { BRAND_NAME } from '../lib/brand';

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
};

const SIZE: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl',
};

/** Premium semi-bold wordmark used across ribbon, welcome, and system dialogs. */
export default function BrandLogo({ size = 'md', className = '', id }: BrandLogoProps) {
  return (
    <span
      id={id}
      className={[
        'font-semibold tracking-tight text-zinc-100 select-none',
        SIZE[size],
        className,
      ].join(' ')}
      aria-label={BRAND_NAME}
    >
      {BRAND_NAME}
    </span>
  );
}
