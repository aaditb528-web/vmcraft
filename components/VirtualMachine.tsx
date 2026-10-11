"use client";

import { useEffect, useRef, useState } from "react";
import { V86Manager } from "@/lib/v86Manager";

interface VirtualMachineProps {
  manager: V86Manager;
  onReady?: () => void;
}

export default function VirtualMachine({ manager, onReady }: VirtualMachineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const [command, setCommand] = useState("");
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || startedRef.current) return;
    startedRef.current = true;

    manager
      .start({
        screenContainer: el,
        cdromUrl: "/v86/linux.iso",
        memorySize: 64 * 1024 * 1024,
      })
      .then(() => onReady?.());
  }, [manager, onReady]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const container = containerRef.current;
    if (!wrapper || !container) return;

    const update = () => {
      const cw = container.offsetWidth;
      const ch = container.offsetHeight;
      const ww = wrapper.clientWidth - 32;
      const wh = wrapper.clientHeight - 32;
      if (cw < 16 || ch < 16 || ww < 16 || wh < 16) return;
      const s = Math.min(ww / cw, wh / ch);
      setScale(s > 0 ? s : 1);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrapper);
    ro.observe(container);
    const interval = window.setInterval(update, 500);
    return () => {
      ro.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    manager.sendText(command);
    manager.sendEnter();
    setCommand("");
  };

  return (
    <div className="w-full h-full bg-black overflow-hidden flex flex-col">
      <div
        ref={wrapperRef}
        className="flex-1 overflow-hidden relative flex items-start justify-start p-4"
      >
        <div
          ref={containerRef}
          id="screen_container"
          tabIndex={0}
          className="outline-none"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div
            style={{
              whiteSpace: "pre",
              font: "14px monospace",
              lineHeight: "14px",
              color: "#fff",
            }}
          />
          <canvas style={{ display: "none" }} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-neutral-800 p-2 flex gap-2 bg-neutral-950"
      >
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Type a command and press Enter..."
          className="flex-1 bg-neutral-900 text-white px-3 py-1.5 rounded text-sm font-mono outline-none focus:ring-1 focus:ring-neutral-700"
        />
        <button
          type="submit"
          className="px-4 py-1.5 bg-neutral-800 text-white rounded text-sm hover:bg-neutral-700 font-mono"
        >
          Send
        </button>
      </form>
    </div>
  );
}