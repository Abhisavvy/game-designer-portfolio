"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  placeholder?: React.ReactNode;
  priority?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = "", 
  placeholder,
  priority = false 
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Show placeholder if image fails to load or no src
  if (imageError || !src) {
    return (
      <div className={`flex items-center justify-center bg-zinc-800/50 ${className}`}>
        {placeholder}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`object-cover transition-all duration-300 ${
          imageLoading ? 'opacity-20' : 'opacity-100'
        }`}
        onLoad={() => setImageLoading(false)}
        onError={() => setImageError(true)}
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