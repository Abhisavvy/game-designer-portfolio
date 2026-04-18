"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

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
  loading?: "lazy" | "eager";
  sizes?: string;
  /** Enable WebP/AVIF format detection */
  enableFormatOptimization?: boolean;
  /** Enable progressive loading */
  progressive?: boolean;
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
  loading = "lazy",
  sizes,
  enableFormatOptimization = true,
  progressive = false
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Enhanced format detection
  useEffect(() => {
    if (!enableFormatOptimization) return;

    const detectOptimalFormat = async () => {
      const baseUrl = src.replace(/\.[^/.]+$/, "");
      
      // Test AVIF support and availability  
      if (supportsAvif()) {
        try {
          const avifUrl = `${baseUrl}.avif`;
          const avifResponse = await fetch(avifUrl, { method: 'HEAD' });
          if (avifResponse.ok) {
            setCurrentSrc(avifUrl);
            return;
          }
        } catch (e) {
          // AVIF not available
        }
      }

      // Test WebP support and availability
      if (supportsWebp()) {
        try {
          const webpUrl = `${baseUrl}.webp`;
          const webpResponse = await fetch(webpUrl, { method: 'HEAD' });
          if (webpResponse.ok) {
            setCurrentSrc(webpUrl);
            return;
          }
        } catch (e) {
          // WebP not available
        }
      }
    };

    detectOptimalFormat();
  }, [src, enableFormatOptimization]);

  const handleImageError = () => {
    if (currentSrc === src && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setImageLoading(true);
    } else if (currentSrc === fallbackSrc && secondaryFallback) {
      setCurrentSrc(secondaryFallback);
      setImageLoading(true);
    } else {
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
        loading={priority ? undefined : loading}
        sizes={sizes ?? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        className={`object-cover object-center transition-all duration-300 ${
          progressive && imageLoading ? 'opacity-0' : imageLoading ? 'opacity-20' : 'opacity-100'
        }`}
        onLoad={() => setImageLoading(false)}
        onError={handleImageError}
      />
      
      {/* Enhanced loading state with shimmer for progressive mode */}
      {imageLoading && (
        <div className={`absolute inset-0 ${
          progressive 
            ? 'bg-gradient-to-br from-zinc-700 to-zinc-800 animate-pulse' 
            : 'bg-zinc-800/20 flex items-center justify-center'
        }`}>
          {!progressive && (
            <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full" />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Check if browser supports WebP format
 */
function supportsWebp(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Check if browser supports AVIF format
 */
function supportsAvif(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  try {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  } catch {
    return false;
  }
}