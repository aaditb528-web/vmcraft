"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import VirtualMachine from "@/components/VirtualMachine";
import { V86Manager } from "@/lib/v86Manager";

interface PageProps {
  params: { id: string };
}

export default function SharedSnapshotPage({ params }: PageProps) {
  const managerRef = useRef<V86Manager | null>(null);
  if (managerRef.current === null) {
    managerRef.current = new V86Manager();
  }
  const manager = managerRef.current;
  const [status, setStatus] = useState("Loading snapshot...");
  const [error, setError] = useState<string | null>(null);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const backend =
      process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

    (async () => {
      try {
        setStatus("Downloading snapshot...");
        const res = await fetch(`${backend}/snapshot/${params.id}`);
        if (!res.ok) {
          throw new Error(`Backend returned ${res.status}`);
        }
        const buf = await res.arrayBuffer();

        setStatus("Booting VM...");
        await manager.start({
          screenContainer:
            document.getElementById("screen_container") ?? document.body,
          cdromUrl: "/v86/dsl.iso",
          memorySize: 256 * 1024 * 1024,
          autostart: false,
        });

        setStatus("Restoring state...");
        await manager.restoreState(buf);
        setStatus("Restored");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        setStatus("Failed");
      }
    })();
  }, [manager, params.id]);

  if (error) {
    return (
      <main className="w-screen h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="text-2xl font-semibold">Snapshot unavailable</div>
          <div className="text-neutral-400 text-sm font-mono">{error}</div>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md text-sm"
          >
            Back to VMCraft
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-screen h-screen bg-black overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 px-4 py-2 bg-neutral-950 border-b border-neutral-800">
        <Link href="/" className="text-sm text-neutral-400 hover:text-white">
          VMCraft
        </Link>
        <div className="h-5 w-px bg-neutral-800" />
        <div className="text-sm text-neutral-300">Shared snapshot</div>
        <div className="ml-auto text-xs text-neutral-500 font-mono">
          {status}
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <VirtualMachine manager={manager} />
      </div>
    </main>
  );
}