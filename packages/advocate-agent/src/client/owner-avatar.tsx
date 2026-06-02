"use client";

import { useState } from "react";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function OwnerAvatar({
  name,
  photo,
}: {
  name: string;
  photo?: string;
}) {
  const [failed, setFailed] = useState(false);
  const show = !!photo && !failed;

  return (
    <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gold/35 bg-surface">
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple/30 to-gold/15 text-[0.65rem] font-medium text-gold-bright">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
