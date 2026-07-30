[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

# Dungeon Crawler's Companion — Desktop

A desktop companion app for the [Dungeon Crawler's Companion](https://www.dccompanion.com)
TTRPG toolkit. It opens the site in its own dedicated window and streams the site's audio
straight into a Discord voice call — so a GM can run the online table's music, ambiance, and
soundboard from one place while everyone listens in Discord.

> **This is a fork of [Kenku FM](https://github.com/owlbear-rodeo/kenku-fm)** by Owlbear Rodeo.
> Kenku FM does the hard part — capturing browser-tab audio and mixing it into a Discord voice
> call through a user-supplied bot — and this fork reskins and trims it into a single-purpose
> companion for dccompanion.com. See [Relationship to Kenku FM](#relationship-to-kenku-fm) below.

## What this fork does differently

- **Opens locked to dccompanion.com.** Instead of Kenku's built-in media player, the always-present
  view is the Dungeon Crawler's Companion site itself, so the app feels like a desktop version of
  the site with Discord audio built in.
- **DCC theme + icons.** Dark/gold Dungeon Crawler's Companion palette, app icon, and a branded
  installer animation replace the Kenku FM look.
- **Focus mode (F11).** Hides all app chrome so the site fills the window — great for running the
  GM Screen on a second monitor. Audio keeps streaming underneath.
- **Collapsible controls panel.** The Discord output/settings panel is a toggled overlay rather than
  an always-on sidebar, so the site gets the full width by default.
- **Pop-out tabs.** Any extra tab (for example the Owlbear Rodeo room opened by "Launch VTT") can be
  popped into its own window for dual-monitor setups, and re-docks when that window is closed.
- **Trimmed UI.** Kenku's media-player, bookmarks, and unused input/output toggles are removed to
  keep the app focused on the one job.

## How it works

1. It's an [Electron](https://www.electronjs.org/) application written in
   [TypeScript](https://www.typescriptlang.org/) and [React](https://reactjs.org/) (Redux Toolkit
   for state) — the same architecture as Kenku FM.
2. An Electron browser view displays the Dungeon Crawler's Companion website.
3. You create and provide your own **Discord bot token** to connect to Discord (done once in the
   app's settings).
4. The Electron media-capture API captures the site view's audio; it's mixed through a Web Audio
   context and sent to a Discord voice channel. Whatever plays on the site — the GM Screen's Music
   and Soundboard tools — is what your players hear.

## Installing

Prebuilt Windows installers are produced by the **Build Windows Installer** GitHub Actions workflow
(`.github/workflows/build-windows.yml`); download the artifact from a completed run, or grab a
tagged release if one is published. The installer is unsigned, so Windows SmartScreen will show a
"Windows protected your PC" prompt on first run — choose **More info → Run anyway**.

## Building

This fork builds with **npm** and [Electron Forge](https://www.electronforge.io/). Because it uses
the [castlabs](https://github.com/castlabs/electron-releases) (Widevine) build of Electron, the
Electron download has to come from the castlabs mirror.

Install dependencies (the `--legacy-peer-deps` flag is required for the current dependency set):

```
npm install --legacy-peer-deps
```

Run in development:

```
npm start
```

Make a production build:

```
npx electron-forge make
```

The GitHub Actions workflow does all of this on a `windows-2022` runner and sets
`ELECTRON_MIRROR=https://github.com/castlabs/electron-releases/releases/download/` so npm can fetch
the castlabs Electron build. If you build locally, set that same environment variable first.

## Protected media

Because the app acts as a web browser, it uses the castlabs
[Electron for Content Security](https://github.com/castlabs/electron-releases) build to support
Google's Widevine [Content Decryption Module (CDM)](https://www.widevine.com/) for DRM-protected
media on Windows and macOS. Linux support is limited (no Verified Media Path, so sites like Spotify
that require VMP won't work; there's no ARM Linux Widevine build at all). This is inherited from
Kenku FM.

## Project structure

All source lives in `src`:

- `index.ts` and the `main` folder — the Electron main process: the Discord connection, the optional
  remote-control HTTP server, and the browser-view manager (which now also handles pop-out windows).
- `renderer.ts` and the `renderer` folder — the React/Redux UI (tabs, controls panel, settings,
  focus mode).
- `preload.ts` and the `preload` folder — the bridge exposing main-process functionality to the
  renderer.
- `assets` — icons and the installer `loading.gif`.

## Relationship to Kenku FM

This project is a modified version of **Kenku FM** (© Owlbear Rodeo), used and distributed under the
GNU General Public License v3.0. All credit for the underlying audio-capture-to-Discord engine
belongs to the Kenku FM authors. The original project lives at
<https://github.com/owlbear-rodeo/kenku-fm>.

Summary of changes made in this fork: reskinned to the Dungeon Crawler's Companion brand; the
built-in media player replaced with the dccompanion.com site as the locked home view; added focus
mode, a collapsible controls panel, and pop-out tab windows; removed the bookmarks UI and several
unused settings; renamed the application, icons, and installer artifacts. The full history of
changes is in this repository's commits.

## License

Licensed under the **GNU General Public License v3.0**, the same license as Kenku FM. See
[`LICENSE`](./LICENSE). As a GPL v3 work, the source for this app is available and any distributed
modifications must remain under GPL v3.

## Contributing

This is a personal fork maintained for the Dungeon Crawler's Companion table. For the upstream
project and its contribution policy, see [Kenku FM](https://github.com/owlbear-rodeo/kenku-fm).
