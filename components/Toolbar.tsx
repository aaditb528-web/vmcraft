"use client";

import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Share2,
} from "lucide-react";

interface ToolbarProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: () => void;
  onShare: () => void;
}

export default function Toolbar({
  onStart,
  onPause,
  onReset,
  onExport,
  onImport,
  onShare,
}: ToolbarProps) {
  const buttons = [
    { icon: Play, label: "Start", action: onStart },
    { icon: Pause, label: "Pause", action: onPause },
    { icon: RotateCcw, label: "Reset", action: onReset },
    { icon: Download, label: "Export", action: onExport },
    { icon: Upload, label: "Import", action: onImport },
    { icon: Share2, label: "Share", action: onShare },
  ];

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-neutral-950 border-b border-neutral-800">
      <div className="text-sm font-medium text-white mr-3 pl-1">VMCraft</div>
      <div className="h-5 w-px bg-neutral-800 mr-2" />
      {buttons.map(({ icon: Icon, label, action }) => (
        <button
          key={label}
          onClick={action}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
        >
          <Icon size={14} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}