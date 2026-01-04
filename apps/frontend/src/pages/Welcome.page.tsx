import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { useState } from "react";
import { useNavigate } from "react-router";

interface WelcomeSlideProps {
	title: string;
	subtitle: string;
	description: string;
	icon: string;
}

const WelcomeSlide = ({ title, subtitle, description, icon }: WelcomeSlideProps) => (
	<Box
		sx={{
			textAlign: "center",
			py: { xs: 4, md: 6 },
			px: 3,
			minHeight: "60vh",
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center",
		}}
	>
		<Box sx={{ mb: 4 }}>
			<Box
				sx={{
					fontSize: { xs: "4rem", md: "6rem" },
					lineHeight: 1,
					mb: 2,
				}}
			>
				{icon}
			</Box>
		</Box>

		<Box sx={{ maxWidth: 400, mx: "auto" }}>
			<Box
				sx={{
					fontSize: { xs: "1.5rem", md: "2rem" },
					fontWeight: 600,
					color: "text.primary",
					mb: 2,
					lineHeight: 1.2,
				}}
			>
				{title}
			</Box>

			<Box
				sx={{
					fontSize: { xs: "1.1rem", md: "1.25rem" },
					color: "text.secondary",
					mb: 3,
					lineHeight: 1.6,
				}}
			>
				{subtitle}
			</Box>

			<Box
				sx={{
					fontSize: { xs: "0.95rem", md: "1rem" },
					color: "text.secondary",
					lineHeight: 1.7,
				}}
			>
				{description}
			</Box>
		</Box>
	</Box>
);

const slides = [
	{
		title: "Welcome to HelioCoach",
		subtitle: "Your personal supplement coach",
		description: "Build consistent supplement habits with reliable reminders and one-tap logging. No more forgotten doses or broken streaks.",
		icon: "🌅",
	},
	{
		title: "Rock-solid reminders",
		subtitle: "That actually work",
		description: "Get notifications exactly when you need them. Our smart system adapts to your schedule and helps you stay on track.",
		icon: "🔔",
	},
	{
		title: "Build better habits",
		subtitle: "One day at a time",
		description: "Track your consistency, celebrate streaks, and use shields when life gets busy. Small actions lead to big results.",
		icon: "🔥",
	},
];

export default function WelcomePage() {
	const navigate = useNavigate();
	const [currentSlide, setCurrentSlide] = useState(0);

	const handleNext = () => {
		if (currentSlide < slides.length - 1) {
			setCurrentSlide(currentSlide + 1);
		} else {
			// Navigate to add first supplement
			navigate("/user-stack/new");
		}
	};

	const handleSkip = () => {
		navigate("/user-stack/new");
	};

	const slide = slides[currentSlide]!;
	const isLastSlide = currentSlide === slides.length - 1;

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Container maxWidth="sm">
				{/* Progress dots */}
				<Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 4 }}>
					{slides.map((slide, index) => (
						<Box
							key={`dot-${slide.title}`}
							sx={{
								width: 8,
								height: 8,
								borderRadius: "50%",
								backgroundColor: index === currentSlide ? "white" : "rgba(255,255,255,0.3)",
								transition: "all 0.3s ease",
							}}
						/>
					))}
				</Box>

				{/* Slide content */}
				<Box
					sx={{
						backgroundColor: "rgba(255,255,255,0.95)",
						borderRadius: 4,
						backdropFilter: "blur(10px)",
						boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
						overflow: "hidden",
						transition: "all 0.3s ease",
					}}
				>
					<WelcomeSlide
						title={slide.title}
						subtitle={slide.subtitle}
						description={slide.description}
						icon={slide.icon}
					/>
				</Box>

				{/* Navigation buttons */}
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					sx={{ mt: 4, px: 1 }}
				>
					<Button
						variant="text"
						onClick={handleSkip}
						sx={{
							color: "rgba(255,255,255,0.8)",
							textTransform: "none",
							fontSize: "1rem",
							fontWeight: 500,
							"&:hover": {
								color: "white",
								backgroundColor: "transparent",
							},
						}}
					>
						Skip
					</Button>

					<Button
						variant="contained"
						onClick={handleNext}
						sx={{
							backgroundColor: "white",
							color: "#667eea",
							textTransform: "none",
							fontSize: "1rem",
							fontWeight: 600,
							px: 4,
							py: 1.5,
							borderRadius: 3,
							boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
							"&:hover": {
								backgroundColor: "rgba(255,255,255,0.9)",
								boxShadow: "0 6px 24px rgba(0,0,0,0.3)",
								transform: "translateY(-2px)",
							},
							transition: "all 0.2s ease-in-out",
						}}
					>
						{isLastSlide ? "Get Started" : "Next"}
					</Button>
				</Stack>
			</Container>
		</Box>
	);
}