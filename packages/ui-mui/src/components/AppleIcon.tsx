/**
 * AppleIcon - Apple logo as an SVG component
 *
 * @example
 * import { AppleIcon } from '@connected-repo/ui-mui/components/AppleIcon'
 *
 * <Button startIcon={<AppleIcon />}>
 *   Sign in with Apple
 * </Button>
 */

interface AppleIconProps {
	width?: number;
	height?: number;
	color?: string;
}

export const AppleIcon = ({ width = 20, height = 20, color = "#000000" }: AppleIconProps) => (
	<svg
		width={width}
		height={height}
		viewBox="0 0 20 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-label="Apple"
	>
		<path
			d="M14.94 10.467c-.024-2.398 1.957-3.549 2.045-3.604-1.114-1.629-2.85-1.852-3.468-1.878-1.478-.149-2.883.87-3.633.87-.75 0-1.908-.848-3.135-.825-1.613.024-3.1.938-3.93 2.382-1.676 2.91-.429 7.22 1.205 9.581.799 1.155 1.752 2.453 3.003 2.406 1.204-.048 1.659-.779 3.114-.779 1.455 0 1.863.779 3.135.755 1.296-.024 2.118-1.178 2.912-2.337.918-1.34 1.296-2.637 1.32-2.704-.029-.013-2.533-0.972-2.558-3.857l-.01-.01zM12.523 3.315c.664-.803 1.111-1.92.989-3.032-0.956.039-2.115.637-2.8 1.44-.615.711-1.153 1.848-1.008 2.937 1.066.083 2.154-.542 2.819-1.345z"
			fill={color}
		/>
	</svg>
);

export type { AppleIconProps };
