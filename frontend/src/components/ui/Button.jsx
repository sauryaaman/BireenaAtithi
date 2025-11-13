// import { forwardRef } from 'react';
// import { cn } from '../../utils/cn';

// const Button = forwardRef(
//   (
//     {
//       className,
//       variant = 'primary',
//       size = 'default',
//       asChild = false,
//       loading = false,
//       children,
//       ...props
//     },
//     ref
//   ) => {
//     const baseStyles =
//       'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50';

//     const variants = {
//       primary: 'bg-primary text-white hover:bg-primary/90',
//       secondary: 'bg-gradient-red text-white hover:bg-gradient-red/90',
//       outline:
//         'border border-primary text-primary hover:bg-primary hover:text-white',
//       ghost: 'text-dark hover:bg-primary/10 hover:text-primary',
//     };

//     const sizes = {
//       default: 'h-10 px-4 py-2',
//       sm: 'h-9 px-3',
//       lg: 'h-11 px-8',
//       icon: 'h-10 w-10',
//     };

//     return (
//       <button
//         className={cn(
//           baseStyles,
//           variants[variant],
//           sizes[size],
//           loading && 'cursor-wait opacity-50',
//           className
//         )}
//         ref={ref}
//         disabled={loading}
//         {...props}
//       >
//         {loading ? (
//           <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
//         ) : null}
//         {children}
//       </button>
//     );
//   }
// );

// Button.displayName = 'Button';

// export { Button };


import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Button = forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      asChild = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      primary: 'bg-primary text-black hover:bg-primary/90',
      secondary: 'bg-gradient-cyan text-black hover:bg-secondary',
      outline:
        'border border-primary text-primary hover:bg-primary hover:text-black',
      ghost: 'text-cyan-400 hover:bg-primary/10 hover:text-primary',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3',
      lg: 'h-11 px-8',
      icon: 'h-10 w-10',
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          loading && 'cursor-wait opacity-50',
          className
        )}
        ref={ref}
        disabled={loading}
        {...props}
      >
        {loading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
