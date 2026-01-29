import { Box } from "@connected-repo/ui-mui/layout/Box";

interface SupplementSelectionCardProps {
	id: string;
	name: string;
	icon: string;
	selected: boolean;
	onToggle: (id: string) => void;
}

export const SupplementSelectionCard = ({
	id,
	name,
	icon,
	selected,
	onToggle,
}: SupplementSelectionCardProps) => {
	return (
		<Box
			sx={{
				aspectRatio: "1 / 1",
				backgroundColor: selected ? "#FBBC05" : "#FFFFFF",
				borderRadius: 1,
				p: 1,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 1.5,
				cursor: "pointer",
				transition: "all 0.2s ease",
				border: "2px solid",
				borderColor: selected ? "#FBBC05" : "rgba(255, 255, 255, 0.3)",
				minHeight: 100,
				width: "140px",
				"&:hover": {
					transform: "scale(1.02)",
					boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
				},
				"&:active": {
					transform: "scale(0.98)",
				},
			}}
		>
			<Box
				sx={{
					fontSize: "2rem",
					lineHeight: 1,
				}}
			>
				{icon}
			</Box>
			<Box
				sx={{
					fontSize: "0.875rem",
					fontWeight: 600,
					color: selected ? "#FFFFFF" : "#496FB5",
					textAlign: "center",
				}}
			>
				{name}
			</Box>
		</Box>
	);
};

export type { SupplementSelectionCardProps };
