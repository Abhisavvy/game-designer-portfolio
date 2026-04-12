"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  fallbackSrc?: string;
  secondaryFallback?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  placeholder?: React.ReactNode;
  priority?: boolean;
  sizes?: string;
}

export function OptimizedImage({ 
  src, 
  fallbackSrc,
  secondaryFallback,
  alt, 
  width, 
  height, 
  className = "", 
  placeholder,
  priority = false,
  sizes 
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    if (currentSrc === src && fallbackSrc) {
      // Try first fallback
      setCurrentSrc(fallbackSrc);
      setImageLoading(true);
    } else if (currentSrc === fallbackSrc && secondaryFallback) {
      // Try secondary fallback
      setCurrentSrc(secondaryFallback);
      setImageLoading(true);
    } else {
      // All sources failed, show placeholder
      setImageError(true);
    }
  };

  // Show placeholder if all images failed to load or no src
  if (imageError || !currentSrc) {
    return (
      <div className={`flex items-center justify-center bg-zinc-800/50 ${className}`}>
        {placeholder}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        className={`object-cover object-center transition-all duration-300 ${
          imageLoading ? 'opacity-20' : 'opacity-100'
        }`}
        onLoad={() => setImageLoading(false)}
        onError={handleImageError}
        onLoadingComplete={() => setImageLoading(false)}
      />
      {imageLoading && (
        <div className="absolute inset-0 bg-zinc-800/20 flex items-center justify-center">
          <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}