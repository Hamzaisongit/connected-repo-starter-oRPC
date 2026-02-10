import { Components } from "@mui/material/styles";

export const components: Components = {
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
}