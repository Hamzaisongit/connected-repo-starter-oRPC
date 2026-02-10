import { PaletteOptions } from "@mui/material/styles";

export const lightPalette: PaletteOptions = {
	// Light mode: "Airy Compliance" - premium wellness aesthetic
	primary: {
		main: "#0f6499", // Vivid, intense blue tone
		light: "#365FFD", // Brighter, punchy blue
		dark: "#102265", // Deeper, rich blue
		contrastText: "#ffffff",
	},
	secondary: {
		main: "#E0F2FE", // Soft Tint for secondary buttons
		light: "#F0F9FF",
		dark: "#BAE6FD",
		contrastText: "#1A1C2E", // Primary-colored text
	},
	success: {
		main: "#4F6F52", // Sage Green
		light: "#6B8E6F",
		dark: "#3D5740",
		lighter: "rgba(79, 111, 82, 0.08)",
		contrastText: "#fff",
	},
	error: {
		main: "#EB5757", // Deeper muted red for overdue/missed (background)
		light: "#FEF2F2",
		dark: "#FECACA",
		lighter: "rgba(254, 226, 226, 0.08)",
		contrastText: "#991B1B", // Dark red text for contrast
	},
	warning: {
		main: "#FEF3C7",
		light: "#FEF9E7",
		dark: "#FDE68A",
		contrastText: "#92400E",
	},
	info: {
		main: "#E0F2FE",
		light: "#F0F9FF",
		dark: "#BAE6FD",
		contrastText: "#075985",
	},
	background: {
		default: "#d2dae2ff", // Light gradient base
		paper: "#FFFFFF", // Solid white for card backgrounds
	},
	text: {
		primary: "#212121",
		secondary: "#666666",
		disabled: "#9e9e9e",
	},
	divider: "rgba(0, 0, 0, 0.08)",
};

export const darkPalette = {
	// Dark mode: Adapted "Airy Compliance" for dark environments
	primary: {
		main: "#2D3047", // Lighter navy for dark mode
		light: "#4A4E69",
		dark: "#1A1C2E",
		contrastText: "#ffffff",
	},
	secondary: {
		main: "#1E3A5F", // Darker soft tint
		light: "#2E4A6F",
		dark: "#0F1D3A",
		contrastText: "#E0F2FE",
	},
	success: {
		main: "#6B8E6F", // Lighter sage green for dark mode
		light: "#8BAA8F",
		dark: "#4F6F52",
		lighter: "rgba(107, 142, 111, 0.12)",
		contrastText: "#fff",
	},
	error: {
		main: "#ff2146", // Even darker red for dark mode
		light: "#991B1B",
		dark: "#450A0A",
		lighter: "rgba(127, 29, 29, 0.12)",
		contrastText: "#FEE2E2",
	},
	warning: {
		main: "#92400E",
		light: "#B45309",
		dark: "#78350F",
		contrastText: "#FEF3C7",
	},
	info: {
		main: "#075985",
		light: "#0C4A6E",
		dark: "#0C4A6E",
		contrastText: "#E0F2FE",
	},
	background: {
		default: "#121212",
		paper: "#1e1e1e", // Solid dark paper
	},
	text: {
		primary: "#ffffff",
		secondary: "#b0b0b0",
		disabled: "#666666",
	},
	divider: "rgba(255, 255, 255, 0.08)",
};
