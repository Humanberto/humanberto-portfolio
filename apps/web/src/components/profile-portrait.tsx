"use client";

import Image from "next/image";
import { useState } from "react";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-28 w-28 text-2xl sm:h-32 sm:w-32",
  lg: "h-36 w-36 text-3xl sm:h-44 sm:w-44",
} as const;

export function ProfilePortrait({
  name,
  src,
  size = "md",
  className = "",
}: {
  name: string;
  src?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = !!src && !failed;
  const dim = sizeClasses[size];

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border-2 border-gold/40 bg-surface shadow-[0_0_40px_rgba(201,162,39,0.12)] ${dim} ${className}`}
      aria-hidden={!showPhoto}
    >
      {showPhoto ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes={size === "sm" ? "36px" : size === "md" ? "128px" : "176px"}
          onError={() => setFailed(true)}
          priority={size !== "sm"}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple/30 to-gold/20 font-display font-light text-gold-bright"
          aria-label={name}
        >
          {initialsFromName(name)}
        </span>
      )}
    </div>
  );
}
