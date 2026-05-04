import { cn } from "@/lib/utils";
import React from "react";

interface IconButtonProps {
    onClick: React.MouseEventHandler<HTMLButtonElement>; // Mejor tipado
    icon: React.ReactElement;
    className?: string;
    ariaLabel: string; // Obligatorio para accesibilidad
}

const IconButton = ({ onClick, icon, className, ariaLabel }: IconButtonProps) => {
    return (
        <button 
            onClick={onClick} 
            aria-label={ariaLabel}
            className={cn(
                // Cambiamos bg-white por bg-background para soporte dark mode
                "rounded-full flex items-center justify-center bg-background border shadow-md p-2",
                "hover:scale-110 transition-transform duration-200 active:scale-95", // Feedback táctil
                "dark:border-zinc-800 dark:hover:bg-zinc-900",
                className
            )}
        >
            {/* Clonamos el icono para asegurarnos que tenga un tamaño consistente si no se le pasa uno */}
            {React.cloneElement(icon as React.ReactElement<any>, {
                size: 20, 
                className: cn("text-gray-600 dark:text-zinc-400", (icon as any).props.className)
            })}
        </button>
    )
}

export default IconButton;