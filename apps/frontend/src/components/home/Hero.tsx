import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { motion } from "framer-motion";
import React from "react";

interface HeroProps {
	userName?: string;
	greeting: string;
	flavorText: string;
}

export const Hero: React.FC<HeroProps> = ({ userName, greeting, flavorText }) => {

	return (
		<Box
			component={motion.div}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			sx={{
				textAlign: "center",
				py: 0,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
                justifyContent: "center",
                height: 100,
				gap: 1.5,
			}}
		>
			<Box sx={{ position: "relative", display: "inline-block" }}>
				<Typography
					variant="h4"
					sx={{
						fontFamily: '"Playfair Display", Georgia, serif',
						fontWeight: 800,
						color: "text.primary",
						letterSpacing: "-0.02em",
						lineHeight: 1.2,
					}}
				>
					{greeting}, {userName?.split(" ")[0] || "there"}
					<Box
						component="span"
						sx={{
							ml: 1,
							display: "inline-block",
							animation: "wave 2.5s infinite",
							transformOrigin: "70% 70%",
							"@keyframes wave": {
								"0%": { transform: "rotate(0deg)" },
								"10%": { transform: "rotate(14deg)" },
								"20%": { transform: "rotate(-8deg)" },
								"30%": { transform: "rotate(14deg)" },
								"40%": { transform: "rotate(-4deg)" },
								"50%": { transform: "rotate(10deg)" },
								"60%": { transform: "rotate(0deg)" },
								"100%": { transform: "rotate(0deg)" },
							},
						}}
					>
						👋
					</Box>
				</Typography>
			</Box>

			<Typography
				variant="body1"
				sx={{
					color: "text.secondary",
					fontWeight: 500,
					maxWidth: "80%",
					mx: "auto",
					lineHeight: 1,
					fontSize: "1rem",
				}}
			>
				{flavorText}
			</Typography>
		</Box>
	);
};

export default Hero;
