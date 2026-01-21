import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { BackButton } from "@frontend/components/BackButton";
import { CreateUserStackForm } from "@frontend/modules/user-stack/components/CreateUserStackForm";
import { useTheme } from "@mui/material/styles";

export default function CreateUserStackPage() {
	
	const theme = useTheme();

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
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontFamily: 'serif',
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 0.5,
                    }}
                >
                    Build Your Stack
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.5,
                    }}
                >
                    Add your supplements here.
                </Typography>
            </Box>

            {/* Form Component */}
            <CreateUserStackForm />
        </Container>
    );
}