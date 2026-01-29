import { Box } from "@connected-repo/ui-mui/layout/Box";

interface HelioCoachLogoProps {
	variant?: "light" | "dark";
	size?: "sm" | "md" | "lg";
}

const sizeMap = {
	sm: { width: 80 },
	md: { width: 120 },
	lg: { width: 160 },
};

export const HelioCoachLogo = ({ variant = "dark", size = "md" }: HelioCoachLogoProps) => {
	const { width } = sizeMap[size];
	const logoSrc = variant === "light"
		? "/heliocoach-logo-white.png"
		: "/heliocoach-logo-dark.png";

	return (
		<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
			<img
				src={logoSrc}
				alt="HelioCoach"
				style={{
					width,
					height: "auto",
					objectFit: "contain",
				}}
			/>
		</Box>
	);
};

export type { HelioCoachLogoProps };
