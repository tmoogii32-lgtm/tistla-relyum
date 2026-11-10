import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Доод талдаа шатлалтай тайралттай хавтангийн хэлбэр (objectBoundingBox, 0–1) */
const PLATE_D =
  "M 0.01915,0.00107H 0.98085C 0.98574,0.00107 0.99044,0.00300 0.99390,0.00642C 0.99736,0.00984 0.99930,0.01449 0.99930,0.01933V 0.88815C 0.99930,0.89299 0.99736,0.89763 0.99390,0.90105C 0.99044,0.90448 0.98574,0.90640 0.98085,0.90640H 0.64733C 0.63864,0.90640 0.63007,0.90834 0.62224,0.91206C 0.61442,0.91579 0.60754,0.92122 0.60212,0.92794L 0.56153,0.97830C 0.55635,0.98474 0.54976,0.98993 0.54227,0.99350C 0.53478,0.99707 0.52656,0.99892 0.51825,0.99892H 0.01915C 0.01426,0.99892 0.00956,0.99700 0.00610,0.99358C 0.00264,0.99016 0.00070,0.98551 0.00070,0.98067V 0.01933C 0.00070,0.01449 0.00264,0.00984 0.00610,0.00642C 0.00956,0.00300 0.01426,0.00107 0.01915,0.00107Z";

/** Layout-д нэг удаа тавина — `plate-clip` utility үүнийг ашиглана */
export function PlateDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
      <clipPath id="plate-clip" clipPathUnits="objectBoundingBox">
        <path d={PLATE_D} />
      </clipPath>
    </svg>
  );
}

type PlateProps = {
  className?: string;
  /** Зураг өгвөл next/image-ээр дүүргэнэ */
  src?: string;
  alt?: string;
  sizes?: string;
  /** contain: чимэглэл зургийг зүсэхгүй, дотор нь зай үлдээнэ */
  fit?: "cover" | "contain";
  priority?: boolean;
  /** Зурагны оронд өөр контент (видео гэх мэт) */
  children?: ReactNode;
  /** Тайрсан хэлбэр доторх дэвсгэр (жишээ нь bg-surface-dark) */
  fillClassName?: string;
};

/**
 * Шатлалтай булантай зургийн хавтан (хуучин design.js §3).
 * Хэмжээг className-ээр (aspect-ratio, өргөн) өгнө. Hover үед дотогшоо агшина.
 */
export function Plate({
  className,
  src,
  alt = "",
  sizes = "(min-width: 1024px) 25vw, 100vw",
  fit = "cover",
  priority,
  children,
  fillClassName = "bg-(--plate-fill)",
}: PlateProps) {
  return (
    <div className={cn("group relative isolate", className)}>
      <div
        className={cn(
          "plate-clip absolute inset-0 overflow-hidden transition-[inset] duration-700 ease-plate group-hover:inset-[5%]",
          fillClassName,
        )}
      >
        {src && (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={fit === "contain" ? "object-contain p-6" : "object-cover"}
          />
        )}
        {children}
      </div>
      <svg
        className="pointer-events-none absolute inset-0 z-[2] size-full overflow-visible"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d={PLATE_D} className="fill-none stroke-plate-outline [vector-effect:non-scaling-stroke]" />
      </svg>
    </div>
  );
}
