import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { PhotoCameraIcon } from "@connected-repo/ui-mui/icons/PhotoCameraIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";

export function PhotoAssistCard() {
	return (
		<Box
			sx={{
				backgroundColor: "#FFFFFF",
				borderRadius: "20px",
				p: 1.5,
				boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
				border: "1px solid rgba(0, 0, 0, 0.05)",
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1.5,
					cursor: "pointer",
					transition: "all 0.2s ease-in-out",
					p: 1.5,
					borderRadius: "12px",
					"&:hover": {
						backgroundColor: "rgba(224, 242, 254, 0.3)",
					},
				}}
			>
				<Box
					sx={{
						width: 44,
						height: 44,
						borderRadius: "10px",
						backgroundColor: "rgba(224, 242, 254, 0.6)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<PhotoCameraIcon sx={{ color: "#075985", fontSize: "1.35rem" }} />
				</Box>
				<Box sx={{ flex: 1 }}>
					<Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#1A1C2E", mb: 0.125 }}>
						Photo Assist
					</Typography>
					<Typography sx={{ fontSize: "0.7rem", color: "#64748B" }}>
						Tap to scan label instantly
					</Typography>
				</Box>
				<Typography sx={{ color: "#64748B", fontSize: "1.15rem" }}>›</Typography>
			</Box>
		</Box>
	);
}
