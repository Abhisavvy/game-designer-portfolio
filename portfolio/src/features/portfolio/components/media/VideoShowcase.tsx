"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import type { CaseStudyMedia } from "../../data/case-study-media";
import { useViewportMinMd } from "./useMediaPreferences";

type Showcase = NonNullable<CaseStudyMedia["showcases"]>[number];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoShowcase({ item }: { item: Showcase }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [remaining, setRemaining] = useState("0:00");
  const [lazyReady, setLazyReady] = useState(false);
  const md = useViewportMinMd();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !item.videoSrc) {
      setLazyReady(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setLazyReady(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25, rootMargin: "50px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [item.videoSrc]);

  useEffect(() => {
    if (!lazyReady || !item.videoSrc) return;
    const v = videoRef.current;
    if (!v) return;
    v.load();
  }, [lazyReady, item.videoSrc]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!md) {
      v.removeAttribute("autoplay");
      v.preload = "none";
    }
  }, [md]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || !item.videoSrc) return;
    if (v.paused) void v.play();
    else v.pause();
  }, [item.videoSrc]);

  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v?.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
    setRemaining(formatTime(Math.max(0, v.duration - v.currentTime)));
  }, []);

  const onLoadedMeta = useCallback(() => {
    const v = videoRef.current;
    if (!v?.duration) return;
    setRemaining(formatTime(v.duration));
  }, []);

  const onSeek = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const v = videoRef.current;
      const bar = e.currentTarget;
      if (!v?.duration) return;
      const rect = bar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      v.currentTime = (x / rect.width) * v.duration;
    },
    [],
  );

  const requestFs = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const anyV = v as HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
    };
    if (anyV.webkitEnterFullscreen && !md) {
      anyV.webkitEnterFullscreen();
      return;
    }
    if (v.requestFullscreen) void v.requestFullscreen();
  }, [md]);

  const hasVideo = Boolean(item.videoSrc);

  return (
    <div className="my-10">
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-lg border border-zinc-800 bg-black shadow-lg shadow-black/40 ${
          playing ? "playing" : ""
        }`}
      >
        <video
          ref={videoRef}
          className="block w-full bg-zinc-950"
          preload={md ? "metadata" : "none"}
          poster={item.posterSrc}
          controls={false}
          playsInline
          tabIndex={0}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMeta}
          onEnded={() => {
            setPlaying(false);
            setProgress(0);
            const v = videoRef.current;
            if (v?.duration) setRemaining(formatTime(v.duration));
          }}
          onKeyDown={(e) => {
            if (!hasVideo) return;
            if (e.key === " ") {
              e.preventDefault();
              togglePlay();
            }
            if (e.key === "f" || e.key === "F") {
              e.preventDefault();
              requestFs();
            }
          }}
        >
          {lazyReady && item.videoSrc ? (
            <source src={item.videoSrc} type="video/mp4" />
          ) : null}
        </video>

        {hasVideo ? (
          <button
            type="button"
            className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-black/80 text-white transition hover:scale-110 hover:bg-emerald-600/90 md:h-20 md:w-20 h-16 w-16"
            style={{ display: playing ? "none" : "flex" }}
            aria-label={item.ariaLabel}
            onClick={togglePlay}
          >
            <span className="pl-1 text-2xl md:text-3xl" aria-hidden>
              ▶
            </span>
            <span className="mt-1 max-w-[5rem] text-center text-[9px] font-semibold uppercase leading-tight md:text-[10px]">
              {item.playLabel}
            </span>
          </button>
        ) : (
          <p className="pointer-events-none absolute bottom-3 left-3 right-3 rounded bg-black/60 px-2 py-1 text-center text-xs text-zinc-300">
            Add an H.264 MP4 under <code className="text-zinc-400">public/</code> and set{" "}
            <code className="text-zinc-400">videoSrc</code> in case study media.
          </p>
        )}

        {hasVideo ? (
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-10 transition-opacity ${
              md ? "opacity-0 hover:opacity-100 [.playing_&]:opacity-100" : "opacity-100"
            }`}
          >
            <div
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              tabIndex={0}
              className="h-1 w-full cursor-pointer rounded bg-white/30"
              onClick={onSeek}
              onKeyDown={(e) => {
                const v = videoRef.current;
                if (!v?.duration) return;
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  v.currentTime = Math.max(0, v.currentTime - 5);
                }
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  v.currentTime = Math.min(v.duration, v.currentTime + 5);
                }
              }}
            >
              <div
                className="h-full rounded bg-emerald-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-white">
              <span>{remaining}</span>
              <button
                type="button"
                className="rounded px-2 py-1 hover:bg-white/10"
                aria-label="Fullscreen"
                onClick={requestFs}
              >
                ⛶
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
