import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-2xl border border-transparent font-semibold whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-sm hover:bg-primary-dark active:bg-primary-dark",
        outline:
          "border-border bg-surface text-text-primary shadow-xs hover:border-primary hover:bg-primary-surface/30 active:bg-primary-surface/50",
        secondary:
          "bg-primary-surface text-primary-dark hover:bg-primary-surface/80 active:bg-primary-surface",
        ghost:
          "hover:bg-primary-surface/40 hover:text-primary-dark active:bg-primary-surface/60",
        destructive:
          "bg-status-alert text-white shadow-sm hover:bg-red-700 active:bg-red-800",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[48px] px-5 py-3 text-sm gap-2 [&_svg]:h-5 [&_svg]:w-5",
        sm: "min-h-[40px] px-3.5 py-2 text-xs rounded-xl gap-1.5 [&_svg]:h-4 [&_svg]:w-4",
        lg: "min-h-[56px] px-6 py-3.5 text-base rounded-2xl gap-2.5 font-bold shadow-md [&_svg]:h-6 [&_svg]:w-6",
        icon: "min-h-[48px] min-w-[48px] p-2.5 rounded-2xl",
        "icon-sm": "min-h-[40px] min-w-[40px] p-2 rounded-xl",
        "icon-lg": "min-h-[56px] min-w-[56px] p-3 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
