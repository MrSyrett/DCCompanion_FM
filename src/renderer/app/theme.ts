import createTheme, { ThemeOptions } from "@mui/material/styles/createTheme";

// Dungeon Crawler's Companion look: near-black panels, gold accent, deep red for
// secondary, matching the site's dark/gold Cinzel theme.
export const themeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#c8a020", // gold
    },
    secondary: {
      main: "#b03030", // red
    },
    background: {
      paper: "#141416",
      default: "#0d0d0f",
    },
    text: {
      primary: "#e8e8e4",
      secondary: "#8a8a93",
    },
    divider: "#2e2e34",
  },
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily: '"Montserrat", system-ui, -apple-system, "Segoe UI", sans-serif',
    h1: { fontFamily: '"Cinzel", Georgia, serif' },
    h2: { fontFamily: '"Cinzel", Georgia, serif' },
    h3: { fontFamily: '"Cinzel", Georgia, serif' },
    h4: { fontFamily: '"Cinzel", Georgia, serif' },
    h5: { fontFamily: '"Cinzel", Georgia, serif' },
    h6: { fontFamily: '"Cinzel", Georgia, serif' },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: 8,
          "& .MuiSwitch-track": {
            borderRadius: 22 / 2,
          },
          "& .MuiSwitch-thumb": {
            boxShadow: "none",
            width: 16,
            height: 16,
            margin: 2,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          margin: "4px 8px",
          borderRadius: "6px",
        },
        dense: {
          borderRadius: "6px",
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          minWidth: "192px !important",
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);
