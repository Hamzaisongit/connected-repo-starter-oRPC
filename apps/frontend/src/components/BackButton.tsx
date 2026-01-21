import { Button } from "@connected-repo/ui-mui/form/Button";
import { ArrowBackIcon } from "@connected-repo/ui-mui/icons/ArrowBackIcon";
import { IconButton } from "@connected-repo/ui-mui/navigation/IconButton";
import { alpha, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router";

type BackButtonProps = {
	/** Navigation path to go back to. If not provided, uses browser history back */
	to?: string;
	/** Whether to show as icon button only (default: false) */
	iconOnly?: boolean;
	/** Optional label text (only shown when iconOnly is false) */
	label?: string;
	/** Optional custom onClick handler. If provided, overrides default navigation */
	onClick?: () => void;
	/** Custom styles */
	sx?: Record<string, unknown>;
};

/**
 * BackButton - Reusable back navigation component
 *
 * Usage:
 * ```tsx
 * // Go back in browser history
 * <BackButton />
 *
 * // Navigate to specific path
 * <BackButton to="/dashboard" />
 *
 * // Icon only version
 * <BackButton to="/user-stack" iconOnly />
 *
 * // With custom label
 * <BackButton to="/user-stack" label="Back to Stack" />
 *
 * // Custom onClick
 * <BackButton onClick={() => handleCustomBack()} />
 * ```
 */
export const BackButton = ({ to, iconOnly = false, label, onClick, sx }: BackButtonProps) => {
	const navigate = useNavigate();
	const theme = useTheme();

	const handleClick = () => {
		if (onClick) {
			onClick();
		} else if (to) {
			navigate(to);
		} else {
			navigate(-1);
		}
	};

	const defaultButtonSx = {
		color: theme.palette.text.primary,
		minWidth: "auto",
		p: 1,
		"&:hover": {
			bgcolor: alpha(theme.palette.action.hover, 0.04),
		},
		...sx,
	};

	if (iconOnly) {
		return (
			<IconButton onClick={handleClick} sx={defaultButtonSx} aria-label="Go back">
				<ArrowBackIcon />
			</IconButton>
		);
	}

	return (
		<Button
			startIcon={<ArrowBackIcon />}
			onClick={handleClick}
			sx={defaultButtonSx}
			aria-label={label || "Go back"}
		>
			{label}
		</Button>
	);
};
