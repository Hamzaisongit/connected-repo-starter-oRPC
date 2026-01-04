import { CloseIcon } from "@connected-repo/ui-mui/icons/CloseIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { memo } from "react";

interface RemoveButtonProps {
	onClick: () => void;
}

export const RemoveButton = memo<RemoveButtonProps>(({ onClick }) => (
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
			color: "#9CA3AF",
			transition: "all 0.2s ease-in-out",
			"&:hover": {
				color: "#EF4444",
				backgroundColor: "#FEE2E2",
				transform: "scale(1.1)",
			},
		}}
	>
		<CloseIcon sx={{ fontSize: "1rem" }} />
	</Box>
));

RemoveButton.displayName = "RemoveButton";
