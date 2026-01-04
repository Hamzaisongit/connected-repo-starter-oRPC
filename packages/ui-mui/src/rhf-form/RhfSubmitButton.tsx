import { motion } from "framer-motion";
import { useFormState } from "react-hook-form";
import { Button, ButtonProps } from "../form/Button";

export interface RhfSubmitButtonProps {
	props?: ButtonProps;
	isSubmittingText?: string;
	notSubmittingText?: string;
}

export const RhfSubmitButton = ({
	props,
	isSubmittingText = "Submitting...",
	notSubmittingText = "Submit",
}: RhfSubmitButtonProps) => {
	const { isSubmitting } = useFormState();

	return (
		<motion.div
			whileHover={{ y: -2 }}
			whileTap={{ scale: 0.95 }}
		>
			<Button
				type="submit"
				variant="contained"
				color="primary"
				size="large"
				fullWidth
				disabled={isSubmitting}
				sx={{
					py: 1.5,
					fontSize: "1.1rem",
					fontWeight: 600,
					textTransform: "none",
					borderRadius: "24px",
					background: "linear-gradient(135deg, #1A1C2E 0%, #2D3154 100%)",
					boxShadow: "0px 4px 16px rgba(26, 28, 46, 0.3)",
					transition: "all 0.2s ease-in-out",
					"&:hover": {
						background: "linear-gradient(135deg, #2D3047 0%, #3D4166 100%)",
						boxShadow: "0px 6px 24px rgba(26, 28, 46, 0.4)",
					},
					"&:active": {
						boxShadow: "0px 2px 8px rgba(26, 28, 46, 0.2)",
					},
					"&:disabled": {
						background: "linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)",
						color: "#ffffff",
					},
				}}
				{...props}
			>
				{isSubmitting ? isSubmittingText : notSubmittingText}
			</Button>
		</motion.div>
	);
};
