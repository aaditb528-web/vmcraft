"use client";

import { useRef, useState, useCallback } from "react";
import VirtualMachine from "@/components/VirtualMachine";
import Toolbar from "@/components/Toolbar";
import Sidebar, { OSPreset, PRESETS } from "@/components/Sidebar";
import { V86Manager } from "@/lib/v86Manager";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export default function Home() {
  const managerRef = useRef<V86Manager | null>(null);
  if (managerRef.current === null) {
    managerRef.current = new V86Manager();
  }
  const manager = managerRef.current;

  const [selectedPreset, setSelectedPreset] = useState<OSPreset>(PRESETS[0]);
  const [status, setStatus] = useState("Ready");

  const startPreset = useCallback(
    (preset: OSPreset) => {
      setSelectedPreset(preset);
      setStatus("Booting");
      manager.start({
        screenContainer:
          document.getElementById("screen_container") ?? document.body,
        cdromUrl: preset.cdromUrl,
        fdaUrl: preset.fdaUrl,
        hdaUrl: preset.hdaUrl,
        memorySize: preset.memorySize,
      });
    },
    [manager],
  );

  const handleSelectPreset = useCallback(
    (preset: OSPreset) => startPreset(preset),
    [startPreset],
  );

  const handleStart = useCallback(() => {
    startPreset(selectedPreset);
  }, [startPreset, selectedPreset]);

  const handlePause = useCallback(() => {
    manager.pause();
    setStatus("Paused");
  }, [manager]);

  const handleReset = useCallback(() => {
    setStatus("Booting");
    manager.reset();
  }, [manager]);

  const handleExport = useCallback(async () => {
    const state = await manager.saveState();
    if (!state) return;
    const blob = new Blob([state], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vmcraft-snapshot-${Date.now()}.bin`;
    a.click();
    URL.revokeObjectURL(url);
  }, [manager]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".bin";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const buffer = await file.arrayBuffer();
        await manager.restoreState(buffer);
        setStatus("Restored from file");
      }
    };
    input.click();
  }, [manager]);

  const handleShare = useCallback(async () => {
    setStatus("Uploading snapshot...");
    const state = await manager.saveState();
    if (!state) {
      setStatus("Nothing to share");
      return;
    }

    try {
      const form = new FormData();
      form.append(
        "file",
        new Blob([state], { type: "application/octet-stream" }),
        "snapshot.bin",
      );
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }
      const data: { id: string; size: number } = await res.json();
      const shareUrl = `${window.location.origin}/s/${data.id}`;
      await navigator.clipboard.writeText(shareUrl).catch(() => {});
      prompt("Share link copied. Send it to a friend:", shareUrl);
      setStatus("Shared");
    } catch (e) {
      setStatus("Share failed");
      alert(
        `Could not upload snapshot. Is the backend running at ${BACKEND_URL}?\n\n${
          e instanceof Error ? e.message : ""
        }`,
      );
    }
  }, [manager]);

  return (
    <main className="w-screen h-screen bg-black overflow-hidden flex">
      <Sidebar
        onSelectPreset={handleSelectPreset}
        selectedPresetId={selectedPreset?.id}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Toolbar
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onExport={handleExport}
          onImport={handleImport}
          onShare={handleShare}
        />
        <div className="flex-1 overflow-hidden relative">
          <VirtualMachine
            manager={manager}
            onReady={() => setStatus("Running")}
          />
          <div className="absolute top-2 right-2 text-xs text-neutral-500 font-mono pointer-events-none">
            {status} · {selectedPreset?.name}
          </div>
        </div>
      </div>
    </main>
  );
}