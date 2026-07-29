import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Tab } from "../tabs/tabsSlice";

import icon from "../../../assets/icon.png";

// The one, always-present, un-closable view is locked to the Dungeon Crawler's
// Companion site. This is what makes the app "the desktop version of the site":
// it opens here on launch, its audio is captured automatically (like any view),
// and there's no URL bar / new-tab UI to navigate away. Change HOME_URL to point
// elsewhere. No preload — we don't inject Kenku's player-remote hooks into the site.
export const HOME_URL = "https://www.dccompanion.com";

export interface PlayerState {
  tab: Tab & { preload?: string };
  remoteEnabled: boolean;
}

const initialState: PlayerState = {
  tab: {
    id: -1,
    icon: icon,
    url: HOME_URL,
    preload: undefined,
    title: "Dungeon Crawler's Companion",
    playingMedia: 0,
    muted: false,
  },
  remoteEnabled: false,
};

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    enableRemote: (state, action: PayloadAction<boolean>) => {
      state.remoteEnabled = action.payload;
    },
    setPlayerId: (state, action: PayloadAction<number>) => {
      state.tab.id = action.payload;
    },
    increasePlayingMedia: (state) => {
      state.tab.playingMedia += 1;
    },
    decreasePlayingMedia: (state) => {
      state.tab.playingMedia = Math.max(state.tab.playingMedia - 1, 0);
    },
    setMuted: (state, action: PayloadAction<boolean>) => {
      state.tab.muted = action.payload;
    },
  },
});

export const {
  enableRemote,
  setPlayerId,
  increasePlayingMedia,
  decreasePlayingMedia,
  setMuted,
} = playerSlice.actions;

export default playerSlice.reducer;
