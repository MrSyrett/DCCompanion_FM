import { BrowserWindow } from "electron";

// Auto-update is intentionally disabled.
//
// This fork previously pointed Squirrel's feed at Kenku FM's own release
// server (https://download.kenku.fm). On Windows, Electron's `autoUpdater`
// IS Squirrel, so the app periodically pulled GENUINE Kenku FM builds and
// installed them over this fork -- which is what produced a stray "Kenku FM"
// desktop shortcut and left the install in a broken state that wouldn't
// relaunch.
//
// This fork has no update feed of its own, so the safe behaviour is to not
// check for updates at all.
//
// To enable updates LATER against our own GitHub releases instead, the CI
// workflow already attaches the Squirrel `.nupkg` + `RELEASES` assets, so you
// can use update.electronjs.org, e.g.:
//
//   import { app, autoUpdater } from "electron";
//   const feed =
//     `https://update.electronjs.org/MrSyrett/kenku-fm-focus/` +
//     `${process.platform}/${app.getVersion()}`;
//   autoUpdater.setFeedURL({ url: feed });
//   autoUpdater.checkForUpdates();
//
// Never point this back at download.kenku.fm.
export function runAutoUpdate(_window: BrowserWindow): void {
  return;
}
