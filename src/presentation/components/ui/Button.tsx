import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded font-rajdhani font-semibold tracking-widest uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2 focus-visible:ring-offset-deep-black cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-neon-blue text-deep-black hover:brightness-110 active:brightness-90 shadow-[0_0_14px_rgba(0,212,255,0.45)] hover:shadow-[0_0_22px_rgba(0,212,255,0.7)]',
        secondary:
          'bg-transparent border border-neon-blue text-neon-blue hover:bg-neon-blue/10 active:bg-neon-blue/20',
        danger:
          'bg-transparent border border-neon-red text-neon-red hover:bg-neon-red/10',
        ghost:
          'bg-transparent text-steel hover:text-neon-blue hover:bg-neon-blue/5',
        orange:
          'bg-neon-orange text-white hover:brightness-110 shadow-[0_0_14px_rgba(255,102,0,0.4)] hover:shadow-[0_0_22px_rgba(255,102,0,0.65)]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-8 w-8 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
