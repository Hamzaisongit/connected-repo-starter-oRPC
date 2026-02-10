import type { PaletteMode } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { darkPalette, lightPalette } from "./color-scheme";
import "./theme.types"; // Import type augmentations
import { components } from "./components";
import { typography } from "./typography";

export const createAppTheme = (mode: PaletteMode = "light") => {
	return createTheme({
		typography,
		shape: {
			borderRadius: 32, // Global 32px for main cards and buttons
		},
		spacing: 8,
		components,
		palette: {
			mode,
			...(mode === "light" ? lightPalette : darkPalette),
		},
	});
};

/**
 * Default light theme (for backwards compatibility)
 */
export const theme = createAppTheme("light");
