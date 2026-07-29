import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import styled from "@mui/material/styles/styled";
import Alert from "@mui/material/Alert";

import { ActionDrawer } from "../common/ActionDrawer";

import { Tabs } from "../features/tabs/Tabs";
import {
  setFocusMode,
  toggleFocusMode,
} from "../features/settings/settingsSlice";

import icon from "../../assets/icon.svg";

import "./App.css";
import Typography from "@mui/material/Typography";

const WallPaper = styled("div")({
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
  overflow: "hidden",
  background: "linear-gradient(#2D3143 0%, #1e2231 100%)",
  zIndex: -1,
});

export function App() {
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [fatalError, setFatalError] = useState<string>();

  const dispatch = useDispatch();

  useEffect(() => {
    window.kenku.on("MESSAGE", (args) => {
      const message = args[0];
      setMessage(message);
    });
    window.kenku.on("ERROR", (args) => {
      const error = args[0];
      setError(error);
    });
    window.kenku.on("FATAL_ERROR", (args) => {
      const error = args[0];
      setFatalError(error);
    });

    return () => {
      window.kenku.removeAllListeners("MESSAGE");
      window.kenku.removeAllListeners("ERROR");
      window.kenku.removeAllListeners("FATAL_ERROR");
    };
  }, []);

  // Focus mode: always start windowed (so you can never launch into a chromeless
  // window with no visible way out), and toggle when the main process reports an
  // F11 press — which it forwards even when the embedded site has keyboard focus.
  useEffect(() => {
    dispatch(setFocusMode(false));
    window.kenku.on("FOCUS_MODE_TOGGLE", () => {
      dispatch(toggleFocusMode());
    });
    return () => {
      window.kenku.removeAllListeners("FOCUS_MODE_TOGGLE");
    };
  }, [dispatch]);

  if (fatalError) {
    return (
      <Stack direction="row">
        <WallPaper />
        <Stack
          position="absolute"
          left="0"
          right="0"
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
          gap={1}
        >
          <Stack sx={{ width: "68px", height: "68px", m: 1 }}>
            <img src={icon} />
          </Stack>
          <Typography variant="h4" color="white">
            Oops, something went wrong..
          </Typography>
          <Typography variant="body1" color="white">
            {fatalError}
          </Typography>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack direction="row">
      <WallPaper />
      {/* The drawer stays mounted in focus mode (the full-window web view simply
          covers it). Unmounting it re-ran Settings' one-time effects — restarting
          the remote server (EADDRINUSE) and audio capture (desktop echo). */}
      <ActionDrawer />
      <Tabs />
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={4000}
        onClose={() => setMessage(undefined)}
        message={message}
        sx={{ maxWidth: "192px" }}
      />
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={8000}
        onClose={() => setError(undefined)}
        sx={{ maxWidth: "192px" }}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Stack>
  );
}
