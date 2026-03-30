import Image from "next/image"

import { cn } from "@/lib/utils"

interface BrandLogoProps {
  className?: string
  imageClassName?: string
  priority?: boolean
}

export function BrandLogo({
  className,
  imageClassName,
  priority = false,
}: BrandLogoProps) {
  return (
    <div
      className={cn(
        "relative h-11 w-[150px] sm:h-12 sm:w-[176px] lg:h-14 lg:w-[205px]",
        className,
      )}
    >
      <Image
        src="/images/logo-epicap.jpg"
        alt="Epicap"
        fill
        priority={priority}
        sizes="(max-width: 640px) 150px, (max-width: 1024px) 176px, 205px"
        className={cn("object-contain object-left", imageClassName)}
      />
    </div>
  )
}
