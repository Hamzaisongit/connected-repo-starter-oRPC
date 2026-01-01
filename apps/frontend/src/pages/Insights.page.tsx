import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";

const InsightsPage = () => {
	return (
		<Container maxWidth="lg">
			<Box sx={{ py: 4 }}>
				<Typography variant="h4" fontWeight={600}>
					Insights Route
				</Typography>
				<Typography variant="body1" color="text.secondary">
					This is the insights route for Helio-Coach
				</Typography>
			</Box>
		</Container>
	);
};

export default InsightsPage;