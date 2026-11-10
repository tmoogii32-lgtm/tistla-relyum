"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Plate } from "@/components/ui/Plate";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  poster: string;
  label: string;
};

/**
 * Дуугүй давталттай жижиг видео (хуучин video.js).
 * Харагдах үед автоматаар тоглоно, товч дарж зогсоох / тоглуулах.
 * Хөдөлгөөн багасгах тохиргоотой үед автоматаар тоглохгүй.
 */
export function VideoLightbox({ src, poster, label }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const btn = btnRef.current;
    const video = videoRef.current;
    if (!btn || !video || reduce) return;
    const io = new IntersectionObserver(
      (entries) => {
        const inView = entries[entries.length - 1].isIntersecting;
        if (inView && !userPaused.current && video.paused) video.play().catch(() => {});
        if (!inView && !video.paused) video.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(btn);
    return () => io.disconnect();
  }, [reduce]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => {});
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  return (
    <button
      ref={btnRef}
      type="button"
      aria-label={label}
      aria-pressed={playing}
      onClick={toggle}
      className="group/video relative block aspect-[600/640] w-full min-w-0 flex-1 cursor-pointer"
    >
      <Plate className="size-full">
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover"
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <span
          aria-hidden="true"
          className={cn("absolute inset-0 bg-surface-black/40 transition-opacity duration-250", playing && "opacity-0")}
        />
      </Plate>
      <Image
        src="/assets/play-button.svg"
        width={64}
        height={64}
        alt=""
        className={cn(
          "absolute top-1/2 left-1/2 z-[3] size-16 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-250",
          playing && "opacity-0 group-hover/video:opacity-85 group-focus-visible/video:opacity-85",
        )}
      />
    </button>
  );
}
