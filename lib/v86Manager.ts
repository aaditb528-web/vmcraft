import type { V86Options, V86Starter } from "@/types/v86";

export interface VMOptions {
  screenContainer: HTMLElement;
  memorySize?: number;
  vgaMemorySize?: number;
  cdromUrl?: string;
  hdaUrl?: string;
  fdaUrl?: string;
  autostart?: boolean;
}

export class V86Manager {
  private emulator: V86Starter | null = null;
  private scriptPromise: Promise<void> | null = null;

  private ensureScriptLoaded(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    if (window.V86) return Promise.resolve();
    if (this.scriptPromise) return this.scriptPromise;

    this.scriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        "script[data-v86]",
      );
      if (existing) {
        if (window.V86) return resolve();
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("Failed to load /v86/libv86.js")),
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "/v86/libv86.js";
      script.async = true;
      script.dataset.v86 = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load /v86/libv86.js"));
      document.head.appendChild(script);
    });

    return this.scriptPromise;
  }

  async start(options: VMOptions): Promise<void> {
    if (typeof window === "undefined") return;

    await this.ensureScriptLoaded();

    if (!window.V86) {
      throw new Error("v86 failed to attach to window after loading script.");
    }

    if (this.emulator) {
      this.emulator.stop();
      this.emulator = null;
    }

    const config: V86Options = {
      wasm_path: "/v86/v86.wasm",
      memory_size: options.memorySize ?? 64 * 1024 * 1024,
      vga_memory_size: options.vgaMemorySize ?? 2 * 1024 * 1024,
      screen_container: options.screenContainer,
      bios: { url: "/v86/seabios.bin" },
      vga_bios: { url: "/v86/vgabios.bin" },
      cdrom: options.cdromUrl ? { url: options.cdromUrl } : undefined,
      hda: options.hdaUrl ? { url: options.hdaUrl } : undefined,
      fda: options.fdaUrl ? { url: options.fdaUrl } : undefined,
      autostart: options.autostart ?? true,
    };

    this.emulator = new window.V86(config);
  }

  pause(): void {
    this.emulator?.stop();
  }

  reset(): void {
    this.emulator?.restart();
  }

  async saveState(): Promise<ArrayBuffer | null> {
    if (!this.emulator) return null;
    try {
      return await this.emulator.save_state();
    } catch {
      return null;
    }
  }

  async restoreState(state: ArrayBuffer): Promise<void> {
    if (!this.emulator) return;
    await this.emulator.restore_state(state);
  }

  destroy(): void {
    this.emulator?.destroy();
    this.emulator = null;
  }

  isAlive(): boolean {
    return this.emulator !== null;
  }

  getEmulator(): V86Starter | null {
    return this.emulator;
  }

  sendText(text: string): void {
    if (!this.emulator) return;
    const emu = this.emulator as unknown as {
      keyboard_send_text?: (t: string) => void;
    };
    if (typeof emu.keyboard_send_text === "function") {
      emu.keyboard_send_text(text);
    }
  }

  sendEnter(): void {
    if (!this.emulator) return;
    const emu = this.emulator as unknown as {
      keyboard_send_scancodes?: (codes: number[]) => void;
    };
    if (typeof emu.keyboard_send_scancodes === "function") {
      emu.keyboard_send_scancodes([0x1c, 0x9c]);
    }
  }
}