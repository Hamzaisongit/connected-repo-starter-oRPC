import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { BackButton } from "@frontend/components/BackButton";
import { EditUserStackForm } from "@frontend/modules/user-stack/components/EditUserStackForm";
import { motion } from "framer-motion";
import { useParams } from "react-router";

export default function EditUserStackPage() {
	const { stackId } = useParams<{ stackId: string }>();

	if (!stackId) {
		return null;
	}

	return (
		<Container maxWidth="sm" sx={{ pb: 12 }}>
			{/* Header */}
			<Box sx={{ mb: 2, textAlign: "center", position: "relative" }}>
				<BackButton
					sx={{
						position: "absolute",
						left: 0,
						top: "50%",
						transform: "translateY(-50%)",
					}}
				/>
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
				>
					<Typography
						variant="h4"
						component="h1"
						sx={{
							fontFamily: '"Playfair Display", Georgia, serif',
							fontSize: "1.75rem",
							fontWeight: 700,
							color: "#1A1C2E",
							mb: 0.5,
						}}
					>
						Edit Supplement
					</Typography>
					<Typography
						sx={{
							fontSize: "0.875rem",
							color: "#64748B",
							lineHeight: 1.5,
						}}
					>
						Update your supplement details.
					</Typography>
				</motion.div>
			</Box>

			<EditUserStackForm stackId={stackId} />
		</Container>
	);
}
