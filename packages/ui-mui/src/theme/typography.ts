import { TypographyVariantsOptions } from "@mui/material/styles";

export const typography: TypographyVariantsOptions =  {
    // Body text: Sans-serif for legibility
    fontFamily: [
        "Lato",
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
}