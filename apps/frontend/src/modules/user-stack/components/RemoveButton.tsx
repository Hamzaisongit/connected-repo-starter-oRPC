import { CloseIcon } from "@connected-repo/ui-mui/icons/CloseIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { useTheme } from "@mui/material/styles";
import { memo } from "react";

interface RemoveButtonProps {
	onClick: () => void;
}

export const RemoveButton = memo<RemoveButtonProps>(({ onClick }) => {
	const theme = useTheme();
	return (
		<Box
			onClick={onClick}
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: 28,
				height: 28,
				borderRadius: "50%",
				cursor: "pointer",
				color: theme.palette.text.disabled,
				transition: "all 0.2s ease-in-out",
				"&:hover": {
					color: theme.palette.error.main,
					backgroundColor: theme.palette.error.light,
					transform: "scale(1.1)",
				},
		}}
	>
		<CloseIcon sx={{ fontSize: "1rem" }} />
	</Box>
	);
});

RemoveButton.displayName = "RemoveButton";
