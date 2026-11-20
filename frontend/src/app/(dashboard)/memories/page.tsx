"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MemoriesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/trips");
  }, [router]);

  return (
    <div className="p-8 text-center text-xs font-mono-retro text-gray-400">
      Redirecting to Community Trips...
    </div>
  );
}
