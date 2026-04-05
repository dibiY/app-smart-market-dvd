import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-orbitron font-medium tracking-widest uppercase',
  {
    variants: {
      variant: {
        blue: 'bg-neon-blue/15 text-neon-blue border border-neon-blue/40',
        orange: 'bg-neon-orange/15 text-neon-orange border border-neon-orange/40',
        green: 'bg-neon-green/15 text-neon-green border border-neon-green/40',
        yellow: 'bg-neon-yellow/15 text-neon-yellow border border-neon-yellow/40',
        red: 'bg-neon-red/15 text-neon-red border border-neon-red/40',
        steel: 'bg-steel/10 text-steel border border-steel/30',
      },
    },
    defaultVariants: { variant: 'blue' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
