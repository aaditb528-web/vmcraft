"use client";

export interface OSPreset {
  id: string;
  name: string;
  description: string;
  cdromUrl?: string;
  fdaUrl?: string;
  hdaUrl?: string;
  memorySize?: number;
}

export const PRESETS: OSPreset[] = [
  {
    id: "linux",
    name: "Linux (Buildroot)",
    description: "Tiny bootable Linux, ~6 MB",
    cdromUrl: "/v86/linux.iso",
    memorySize: 64 * 1024 * 1024,
  },
  {
    id: "linux-heavy",
    name: "Linux (128 MB RAM)",
    description: "Same image, more memory",
    cdromUrl: "/v86/linux.iso",
    memorySize: 128 * 1024 * 1024,
  },
  {
    id: "freedos",
    name: "FreeDOS",
    description: "DOS clone, floppy image",
    fdaUrl: "/v86/freedos.img",
    memorySize: 32 * 1024 * 1024,
  },
  {
    id: "dsl",
    name: "Damn Small Linux",
    description: "GUI desktop, Firefox 2.0",
    cdromUrl: "/v86/dsl.iso",
    memorySize: 256 * 1024 * 1024,
  },
];

interface SidebarProps {
  onSelectPreset: (preset: OSPreset) => void;
  selectedPresetId?: string;
}

export default function Sidebar({
  onSelectPreset,
  selectedPresetId,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col">
      <div className="p-4 border-b border-neutral-800">
        <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Operating Systems
        </div>
      </div>
      <div className="flex-1 p-2 space-y-1 overflow-y-auto">
        {PRESETS.map((preset) => {
          const selected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`w-full text-left p-3 rounded-md transition-colors ${
                selected
                  ? "bg-blue-600/20 border border-blue-500/40"
                  : "hover:bg-neutral-900 border border-transparent"
              }`}
            >
              <div className="text-sm text-white font-medium">
                {preset.name}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                {preset.description}
              </div>
            </button>
          );
        })}
      </div>
      <div className="p-3 border-t border-neutral-800 text-xs text-neutral-600 font-mono">
        {PRESETS.length} images bundled
      </div>
    </aside>
  );
}