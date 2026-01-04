import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { CreateUserStackForm } from "@frontend/modules/user-stack/components/CreateUserStackForm";

export default function CreateUserStackPage() {
	return (
		<Container maxWidth="sm" sx={{ pb: 12 }}>

			{/* Header */}
			<Box sx={{ mb: 2, textAlign: "center" }}>
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
					Build Your Stack
				</Typography>
				<Typography
					sx={{
						fontSize: "0.875rem",
						color: "#64748B",
						lineHeight: 1.5,
					}}
				>
					Add your supplements here.
				</Typography>
			</Box>

			<CreateUserStackForm />
		</Container>
	);
}