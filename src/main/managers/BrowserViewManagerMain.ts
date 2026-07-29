import { BrowserWindow, ipcMain, shell, WebContentsView } from "electron";
import { getUserAgent } from "../userAgent";

/**
 * Manager to help create and manager browser views
 * This class is to be run on the main thread
 * For the render thread counterpart see `BrowserViewManagerPreload.ts`
 */
export class BrowserViewManagerMain {
  window: BrowserWindow;
  views: Record<number, WebContentsView>;
  topView: WebContentsView;
  /** Separate OS windows for popped-out views, keyed by view id. */
  popWindows: Record<number, BrowserWindow> = {};

  constructor(window: BrowserWindow) {
    this.window = window;
    this.views = {};

    ipcMain.on(
      "BROWSER_VIEW_CREATE_BROWSER_VIEW",
      this._handleCreateBrowserView
    );
    ipcMain.on(
      "BROWSER_VIEW_REMOVE_BROWSER_VIEW",
      this._handleRemoveBrowserView
    );
    ipcMain.on(
      "BROWSER_VIEW_REMOVE_ALL_BROWSER_VIEWS",
      this._handleRemoveAllBrowserViews
    );
    ipcMain.on("BROWSER_VIEW_HIDE_BROWSER_VIEW", this._handleHideBrowserView);
    ipcMain.on("BROWSER_VIEW_SHOW_BROWSER_VIEW", this._handleShowBrowserView);
    ipcMain.on(
      "BROWSER_VIEW_SET_BROWSER_VIEW_BOUNDS",
      this._handleSetBrowserViewBounds
    );
    ipcMain.on("BROWSER_VIEW_LOAD_URL", this._handleLoadURL);
    ipcMain.on("BROWSER_VIEW_GO_FORWARD", this._handleGoForward);
    ipcMain.on("BROWSER_VIEW_GO_BACK", this._handleGoBack);
    ipcMain.on("BROWSER_VIEW_RELOAD", this._handleReload);
    ipcMain.on("BROWSER_VIEW_POPOUT_BROWSER_VIEW", this._handlePopout);

    this.window.on("resize", this._resizeListener);
  }

  destroy() {
    ipcMain.off(
      "BROWSER_VIEW_CREATE_BROWSER_VIEW",
      this._handleCreateBrowserView
    );
    ipcMain.off(
      "BROWSER_VIEW_REMOVE_BROWSER_VIEW",
      this._handleRemoveBrowserView
    );
    ipcMain.off(
      "BROWSER_VIEW_REMOVE_ALL_BROWSER_VIEWS",
      this._handleRemoveAllBrowserViews
    );
    ipcMain.off("BROWSER_VIEW_HIDE_BROWSER_VIEW", this._handleHideBrowserView);
    ipcMain.off("BROWSER_VIEW_SHOW_BROWSER_VIEW", this._handleShowBrowserView);
    ipcMain.off(
      "BROWSER_VIEW_SET_BROWSER_VIEW_BOUNDS",
      this._handleSetBrowserViewBounds
    );
    ipcMain.off("BROWSER_VIEW_LOAD_URL", this._handleLoadURL);
    ipcMain.off("BROWSER_VIEW_GO_FORWARD", this._handleGoForward);
    ipcMain.off("BROWSER_VIEW_GO_BACK", this._handleGoBack);
    ipcMain.off("BROWSER_VIEW_RELOAD", this._handleReload);
    ipcMain.off("BROWSER_VIEW_POPOUT_BROWSER_VIEW", this._handlePopout);

    this.window.off("resize", this._resizeListener);
    this.removeAllBrowserViews();
  }

  _resizeListener = () => {
    if (!this.window || !this.topView) {
      return;
    }
    const bounds = this.window.getBounds();
    const viewBounds = this.topView.getBounds();

    this.topView.setBounds({
      x: viewBounds.x,
      y: viewBounds.y,
      width: bounds.width - viewBounds.x,
      height: bounds.height - viewBounds.y,
    });
  };

  _handleCreateBrowserView = (
    event: Electron.IpcMainEvent,
    url: string,
    x: number,
    y: number,
    width: number,
    height: number,
    preload?: string
  ) => {
    const id = this.createBrowserView(url, x, y, width, height, preload);
    this.views[id].webContents.on(
      "did-start-navigation",
      (_, url, __, isMainFrame) => {
        if (isMainFrame) {
          event.reply("BROWSER_VIEW_DID_NAVIGATE", id, url);
        }
      }
    );
    this.views[id].webContents.on("page-title-updated", (_, title) => {
      event.reply("BROWSER_VIEW_TITLE_UPDATED", id, title);
    });
    this.views[id].webContents.on("page-favicon-updated", (_, favicons) => {
      event.reply("BROWSER_VIEW_FAVICON_UPDATED", id, favicons);
    });
    this.views[id].webContents.on("media-started-playing", () => {
      event.reply("BROWSER_VIEW_MEDIA_STARTED_PLAYING", id);
    });
    this.views[id].webContents.on("media-paused", () => {
      event.reply("BROWSER_VIEW_MEDIA_PAUSED", id);
    });
    this.views[id].webContents.setWindowOpenHandler(({ url }) => {
      event.reply("BROWSER_VIEW_NEW_TAB", url);
      return { action: "deny" };
    });
    // Forward F11 to the app so focus mode can be toggled even while this web
    // view (the site) has keyboard focus.
    this.views[id].webContents.on("before-input-event", (inputEvent, input) => {
      if (input.type === "keyDown" && input.key === "F11") {
        this.window.webContents.send("FOCUS_MODE_TOGGLE");
        inputEvent.preventDefault();
      }
    });

    let loaded = false;
    this.views[id].webContents.on("did-finish-load", () => {
      if (!loaded) {
        event.reply("BROWSER_VIEW_LOADED", id);
        loaded = true;
      }
    });
    event.returnValue = id;
  };

  _handleRemoveBrowserView = (_: Electron.IpcMainEvent, id: number) =>
    this.removeBrowserView(id);

  _handleRemoveAllBrowserViews = () => this.removeAllBrowserViews();

  _handleHideBrowserView = (_: Electron.IpcMainEvent, id: number) =>
    this.hideBrowserView(id);

  _handleShowBrowserView = (_: Electron.IpcMainEvent, id: number) =>
    this.showBrowserView(id);

  _handleSetBrowserViewBounds = (
    _: Electron.IpcMainEvent,
    id: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) => this.setBrowserViewBounds(id, x, y, width, height);

  _handleLoadURL = (_: Electron.IpcMainEvent, id: number, url: string) =>
    this.loadURL(id, url);

  _handleGoForward = (_: Electron.IpcMainEvent, id: number) =>
    this.goForward(id);

  _handleGoBack = (_: Electron.IpcMainEvent, id: number) => this.goBack(id);

  _handleReload = (_: Electron.IpcMainEvent, id: number) => this.reload(id);

  _handlePopout = (event: Electron.IpcMainEvent, id: number) =>
    this.popoutBrowserView(event, id);

  /**
   * Create a new browser view and attach it to the current window
   * @param url Initial URL
   * @param xOffset Offset from the left side of the screen
   * @returns id of the created window
   */
  createBrowserView(
    url: string,
    x: number,
    y: number,
    width: number,
    height: number,
    preload?: string
  ): number {
    const view = new WebContentsView({
      webPreferences: {
        preload,
      },
    });
    this.window.contentView.addChildView(view);

    view.setBounds({
      x,
      y,
      width,
      height,
    });

    try {
      view.webContents.loadURL(url);
    } catch (err) {
      console.error(err);
    }

    // Spoof user agent to fix compatibility issues with 3rd party apps
    view.webContents.setUserAgent(getUserAgent());

    this.views[view.webContents.id] = view;
    this.topView = view;

    return view.webContents.id;
  }

  removeBrowserView(id: number) {
    if (this.views[id]) {
      this._destroyPopWindow(id);
      if (this.topView === this.views[id]) {
        this.topView = undefined;
      }
      this.views[id].webContents.close({ waitForBeforeUnload: false });
      this.window.contentView.removeChildView(this.views[id]);
      (this.views[id].webContents as any).destroy();
      delete this.views[id];
    }
  }

  removeAllBrowserViews() {
    for (let id in this.views) {
      this._destroyPopWindow(Number(id));
      this.views[id].webContents.close({ waitForBeforeUnload: false });
      this.window.contentView.removeChildView(this.views[id]);
      (this.views[id].webContents as any).destroy();
      this.topView = undefined;
      delete this.views[id];
    }
  }

  /**
   * Tear down the pop-out window for a view (if any) without triggering the
   * re-dock path — used when the underlying view is being destroyed anyway.
   */
  _destroyPopWindow(id: number) {
    const pop = this.popWindows[id];
    if (pop) {
      delete this.popWindows[id];
      pop.removeAllListeners("close");
      pop.removeAllListeners("resize");
      if (!pop.isDestroyed()) {
        pop.destroy();
      }
    }
  }

  hideBrowserView(id: number) {
    if (this.views[id]) {
      if (this.topView === this.views[id]) {
        this.topView = undefined;
      }
      this.window.contentView.removeChildView(this.views[id]);
    }
  }

  showBrowserView(id: number) {
    if (this.views[id]) {
      // A popped-out view lives in its own OS window — don't yank it back into
      // the main window just because its tab got selected.
      if (this.popWindows[id]) {
        return;
      }
      this.window.contentView.addChildView(this.views[id]);
      this.topView = this.views[id];
    }
  }

  /**
   * Detach a web view from the main window and give it its own OS window so it
   * can live on a second monitor. Closing that window re-docks the view back
   * into the main window and notifies the renderer via BROWSER_VIEW_POPPED_IN.
   */
  popoutBrowserView(_event: Electron.IpcMainEvent, id: number) {
    const view = this.views[id];
    if (!view) {
      return;
    }
    // Already popped out — just focus the existing window.
    if (this.popWindows[id]) {
      if (!this.popWindows[id].isDestroyed()) {
        this.popWindows[id].focus();
      }
      return;
    }

    // Detach from the main window.
    if (this.topView === view) {
      this.topView = undefined;
    }
    this.window.contentView.removeChildView(view);

    const title =
      view.webContents.getTitle() || "Dungeon Crawler's Companion";
    const pop = new BrowserWindow({
      width: 1280,
      height: 800,
      title,
      backgroundColor: "#0d0d0f",
      autoHideMenuBar: true,
    });
    this.popWindows[id] = pop;

    pop.contentView.addChildView(view);

    const fit = () => {
      if (pop.isDestroyed()) {
        return;
      }
      const [width, height] = pop.getContentSize();
      view.setBounds({ x: 0, y: 0, width, height });
    };
    fit();
    pop.on("resize", fit);

    // When the popped-out window closes, re-dock the view into the main window.
    // This must happen on "close" (before the window is destroyed) so the view's
    // webContents survives — otherwise it would be torn down with the window.
    let redocked = false;
    pop.on("close", () => {
      if (redocked) {
        return;
      }
      redocked = true;
      try {
        pop.contentView.removeChildView(view);
      } catch (err) {
        console.error(err);
      }
      if (!this.window.isDestroyed() && this.views[id]) {
        this.window.contentView.addChildView(view);
        this.topView = view;
        this.window.webContents.send("BROWSER_VIEW_POPPED_IN", id);
      }
    });
    pop.on("closed", () => {
      delete this.popWindows[id];
    });
  }

  setBrowserViewBounds(
    id: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    try {
      this.views[id].setBounds({ x, y, width, height });
    } catch (err) {
      console.error(err);
    }
  }

  loadURL(id: number, url: string) {
    try {
      this.views[id].webContents.loadURL(url);
    } catch (err) {
      console.error(err);
    }
  }

  goForward(id: number) {
    try {
      this.views[id].webContents.navigationHistory.goForward();
    } catch (err) {
      console.error(err);
    }
  }

  goBack(id: number) {
    try {
      this.views[id].webContents.navigationHistory.goBack();
    } catch (err) {
      console.error(err);
    }
  }

  reload(id: number) {
    try {
      this.views[id].webContents.reload();
    } catch (err) {
      console.error(err);
    }
  }
}
