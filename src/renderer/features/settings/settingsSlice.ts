import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ConnectionStatus = "disconnected" | "connecting" | "ready";
export type StreamingMode = "lowLatency" | "performance";

export interface SettingsState {
  discordToken: string;
  urlBarEnabled: boolean;
  remoteEnabled: boolean;
  remoteAddress: string;
  remotePort: string;
  externalInputsEnabled: boolean;
  multipleInputsEnabled: boolean;
  multipleOutputsEnabled: boolean;
  streamingMode: StreamingMode;
  /**
   * Distraction-free "focus" mode: hides the app chrome (drawer, tab bar, URL
   * bar) and expands the active web view to fill the whole window, so the page
   * looks like it's in its own clean window while audio keeps streaming. Not
   * persisted in practice — App resets it to false on launch so you can never
   * start up with no way to reach the controls (toggle with F11).
   */
  focusMode: boolean;
  /**
   * Whether the controls panel (Discord outputs + settings drawer) is open.
   * When closed, the web view slides left to fill the whole area (minus the top
   * bar) so the site gets maximum space; when open, the view insets by the drawer
   * width to reveal the panel. It's a collapse rather than a true float because
   * the site is a native view that DOM can't overlay.
   */
  panelOpen: boolean;
}

const initialState: SettingsState = {
  discordToken: "",
  urlBarEnabled: true,
  remoteEnabled: false,
  remoteAddress: "127.0.0.1",
  remotePort: "3333",
  externalInputsEnabled: false,
  multipleInputsEnabled: false,
  multipleOutputsEnabled: false,
  streamingMode: "performance",
  focusMode: false,
  panelOpen: false,
};

export const connectionSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setDiscordToken: (state, action: PayloadAction<string>) => {
      state.discordToken = action.payload;
    },
    setURLBarEnabled: (state, action: PayloadAction<boolean>) => {
      state.urlBarEnabled = action.payload;
    },
    setRemoteEnabled: (state, action: PayloadAction<boolean>) => {
      state.remoteEnabled = action.payload;
    },
    setRemoteAddress: (state, action: PayloadAction<string>) => {
      state.remoteAddress = action.payload;
    },
    setRemotePort: (state, action: PayloadAction<string>) => {
      state.remotePort = action.payload;
    },
    setExternalInputsEnabled: (state, action: PayloadAction<boolean>) => {
      state.externalInputsEnabled = action.payload;
    },
    setMultipleInputsEnabled: (state, action: PayloadAction<boolean>) => {
      state.multipleInputsEnabled = action.payload;
    },
    setMultipleOutputsEnabled: (state, action: PayloadAction<boolean>) => {
      state.multipleOutputsEnabled = action.payload;
    },
    setStreamingMode: (state, action: PayloadAction<StreamingMode>) => {
      state.streamingMode = action.payload;
    },
    setFocusMode: (state, action: PayloadAction<boolean>) => {
      state.focusMode = action.payload;
    },
    toggleFocusMode: (state) => {
      state.focusMode = !state.focusMode;
    },
    setPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.panelOpen = action.payload;
    },
    togglePanel: (state) => {
      state.panelOpen = !state.panelOpen;
    },
  },
});

export const {
  setDiscordToken,
  setURLBarEnabled,
  setRemoteEnabled,
  setRemoteAddress,
  setRemotePort,
  setExternalInputsEnabled,
  setMultipleInputsEnabled,
  setMultipleOutputsEnabled,
  setStreamingMode,
  setFocusMode,
  toggleFocusMode,
  setPanelOpen,
  togglePanel,
} = connectionSlice.actions;

export default connectionSlice.reducer;
