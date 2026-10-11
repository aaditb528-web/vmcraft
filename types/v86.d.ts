export interface V86Options {
    wasm_path: string;
    memory_size: number;
    vga_memory_size?: number;
    screen_container: HTMLElement;
    bios: { url: string };
    vga_bios?: { url: string };
    cdrom?: { url: string };
    hda?: { url: string };
    fda?: { url: string };
    autostart?: boolean;
    [key: string]: unknown;
  }
  
  export class V86Starter {
    constructor(options: V86Options);
    stop(): void;
    restart(): void;
    destroy(): void;
    save_state(): Promise<ArrayBuffer>;
    restore_state(state: ArrayBuffer): Promise<void>;
  }
  
  declare global {
    interface Window {
      V86: typeof V86Starter;
    }
  }