# VMCraft

Run a real Linux VM in a browser tab. No installs and no servers.
VMCraft is a browser-based x86 virtual machine emulator that lets you boot Linux and FreeDOS without installing an operating system or running a local VM.
Built with Next.js and v86, VMCraft runs emulation client-side using JavaScript and WebAssembly. It supports multiple bootable operating-system images, VM controls, and machine-state export/import.

**Live demo:** https://vmcraft-qa9luhp3g-me-e104.vercel.app/

---

## What it is

VMCraft boots a full x86 machine inside a browser tab using [v86](https://github.com/copy/v86), a JavaScript/WebAssembly emulator. Everything — the CPU, RAM, disk, graphics — runs client-side on the visitor's hardware. There is no backend doing the work.

You can boot into Linux or FreeDOS, type commands, and save the whole machine state as a file.

## What it can run

- **Linux (Buildroot)** — tiny bootable Linux, ~6 MB, boots in a few seconds
- **FreeDOS** — DOS clone, boots to an `A:\>` prompt
- **Damn Small Linux** — full X11 desktop with Firefox 2.0, taskbar, and window manager

## How it works

The interesting part is that there isn't one. The browser downloads a `.wasm` file (v86's x86 interpreter), a BIOS, and a bootable image. Everything else happens on the visitor's CPU.

- `lib/v86Manager.ts` — wraps v86's API, handles starting/stopping/snapshotting the VM
- `components/VirtualMachine.tsx` — mounts the screen, forwards keystrokes to the emulated keyboard
- `components/Sidebar.tsx` — the OS picker
- `components/Toolbar.tsx` — start / pause / reset / export / import

## Running it locally

```bash
git clone https://github.com/aaditb528-web/vmcraft.git
cd vmcraft
npm install
npm run dev
