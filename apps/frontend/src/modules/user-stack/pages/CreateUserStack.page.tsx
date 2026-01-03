import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { CreateUserStackForm } from "@frontend/modules/user-stack/components/CreateUserStackForm";

export default function CreateUserStackPage() {
	return (
		<Container maxWidth="md" sx={{ py: 4 }}>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					Add to Your Stack
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Create a new supplement or medication in your health stack
				</Typography>
			</Box>
			<CreateUserStackForm />
		</Container>
	);
}