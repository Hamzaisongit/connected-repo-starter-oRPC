import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import "./theme.types"; // Import type augmentations

/**
 * Base theme configuration shared across light and dark modes
 * Implements "Airy Compliance" design language for a premium wellness experience
 *
 * Design Style: Glassmorphism/Neo-minimalist
 * - High border radii (32px cards/buttons, 100px chips) for modern, friendly feel
 * - Soft gradients and semi-transparent backgrounds with backdrop blur
 * - Generous spacing and "airy" layouts
 * - Soft depth shadows (avoid harsh shadows)
 * - Applied selectively where it enhances UX, not overdone
 */
const baseThemeConfig = {
	typography: {
		// Body text: Sans-serif for legibility
		fontFamily: [
			"-apple-system",
			"BlinkMacSystemFont",
			'"Segoe UI"',
			"Roboto",
			'"Helvetica Neue"',
			"Arial",
			"sans-serif",
		].join(","),
		// Headings: High contrast for readability
		h1: {
			fontSize: "2.5rem",
			fontWeight: 600,
			lineHeight: 1.7,
		},
		h2: {
			fontSize: "2rem",
			fontWeight: 600,
			lineHeight: 1.7,
		},
		h3: {
			fontSize: "1.75rem",
			fontWeight: 600,
			lineHeight: 1.7,
		},
		h4: {
			fontSize: "1.5rem",
			fontWeight: 600,
			lineHeight: 1.7,
		},
		h5: {
			fontSize: "1.25rem",
			fontWeight: 600,
			lineHeight: 1.7,
		},
		h6: {
			fontSize: "1rem",
			fontWeight: 600,
			lineHeight: 1.7,
		},
	},
	shape: {
		borderRadius: 32, // Global 32px for main cards and buttons
	},
	spacing: 8,
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none" as const,
					fontWeight: 500,
					borderRadius: "32px",
					minHeight: "56px", // "One-thumb" height
					padding: "12px 24px",
					transition: "all 0.2s ease-in-out",
					"&:hover": {
						transform: "translateY(-2px)",
					},
				},
				contained: {
					boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)", // Soft Depth shadow
				},
			},
			defaultProps: {
				disableElevation: false, // Enable soft depth shadows
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-root": {
						borderRadius: "32px",
						transition: "all 0.2s ease-in-out",
					},
				},
			},
			defaultProps: {
				variant: "outlined" as const,
				size: "small" as const,
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: "32px",
					backgroundColor: "#FFFFFF",
					boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.06)", // Soft Depth shadow
					transition: "all 0.2s ease-in-out",
					border: "1px solid rgba(0, 0, 0, 0.05)",
					"&:hover": {
						transform: "translateY(-2px)",
						boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.1)",
					},
				},
			},
		},
		MuiAlert: {
			styleOverrides: {
				root: {
					borderRadius: "32px",
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					borderRadius: "100px", // Smaller components use 100px
				},
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: {
					minHeight: "44px", // Touch target minimum
					minWidth: "44px",
				},
			},
		},
	},
};

/**
 * Creates a theme with the specified mode (light or dark)
 * Preserves all component overrides and customizations
 *
 * Note: Semi-transparent backgrounds (paper) enable glassmorphism effect.
 * Apply backdrop-filter: blur(10px) in components where glass effect is desired.
 */
export const createAppTheme = (mode: PaletteMode = "light") => {
	return createTheme({
		...baseThemeConfig,
		palette: {
			mode,
			...(mode === "light"
				? {
						// Light mode: "Airy Compliance" - premium wellness aesthetic
						primary: {
							main: "#1A1C2E", // Deep Navy for primary buttons
							light: "#2D3047",
							dark: "#0F1117",
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
							main: "#FEE2E2", // Soft "Muted Salmon" for overdue/missed (background)
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
						default: "#F8FAFC", // Light gradient base
						paper: "#FFFFFF", // Solid white for card backgrounds
					},
						text: {
							primary: "#212121",
							secondary: "#666666",
							disabled: "#9e9e9e",
						},
						divider: "rgba(0, 0, 0, 0.08)",
				  }
				: {
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
							main: "#7F1D1D", // Dark red for dark mode
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
				  }),
		},
	});
};

/**
 * Default light theme (for backwards compatibility)
 */
export const theme = createAppTheme("light");
