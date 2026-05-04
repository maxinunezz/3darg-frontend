import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        // bg-muted suele ser un gris más neutro que bg-accent para cargas
        "bg-muted animate-pulse rounded-xl", 
        "dark:bg-zinc-800/50", // Un poco de transparencia en modo oscuro
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }