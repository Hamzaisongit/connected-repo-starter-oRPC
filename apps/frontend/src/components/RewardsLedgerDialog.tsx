import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import {
	Dialog,
	DialogContent,
	DialogTitle,
} from "@connected-repo/ui-mui/feedback/Dialog";
import { MonetizationOnIcon } from "@connected-repo/ui-mui/icons/MonetizationOnIcon";
import { ShieldIcon } from "@connected-repo/ui-mui/icons/ShieldIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Divider } from "@connected-repo/ui-mui/layout/Divider";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { orpc } from "@frontend/utils/orpc.client";
import { alpha, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

interface RewardsLedgerDialogProps {
	open: boolean;
	onClose: () => void;
	itemType: "coins" | "shields";
}

export const RewardsLedgerDialog = ({
	open,
	onClose,
	itemType,
}: RewardsLedgerDialogProps) => {
	const theme = useTheme();
	const nextCursorRef = useRef<string | null>(null);

	const { data, isLoading } = useQuery({
		...orpc.rewardsLedger.getRewardsHistory.queryOptions({
			input: {
				itemType,
				limit: 50,
				cursor: nextCursorRef.current,
			},
		}),
		enabled: open,
	});

	useEffect(() => {
		nextCursorRef.current = data?.nextCursor || null;
	}, [data]);

	const getTransactionColor = (transactionType: string) => {
		switch (transactionType) {
			case "Earn":
			case "Assigned":
				return theme.palette.success.main;
			case "Use":
			case "Revert":
				return theme.palette.error.main;
			case "Convert":
				return theme.palette.info.main;
			default:
				return theme.palette.text.secondary;
		}
	};

	const formatAmount = (coins: number, shields: number) => {
		if (itemType === "coins") {
			return coins > 0 ? `+${coins}` : `${coins}`;
		}
		return shields > 0 ? `+${shields}` : `${shields}`;
	};

	const title = itemType === "coins" ? "Coin History" : "Shield History";
	const Icon = itemType === "coins" ? MonetizationOnIcon : ShieldIcon;
	const iconColor = itemType === "coins" ? "#FFD700" : theme.palette.primary.main;

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<Icon sx={{ color: iconColor, fontSize: "1.5rem" }} />
				{title}
			</DialogTitle>
			<DialogContent>
				{isLoading ? (
					<Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
						<LoadingSpinner />
					</Box>
				) : data?.items && data.items.length > 0 ? (
					<Stack spacing={0} divider={<Divider />}>
						{data.items.map((item) => {
							const amount = formatAmount(item.amountCoins, item.amountShields);
							const isPositive = itemType === "coins" 
								? item.amountCoins > 0 
								: item.amountShields > 0;

							return (
								<Box
									key={item.rewardLedgerId}
									sx={{
										py: 2,
										display: "flex",
										alignItems: "center",
										gap: 2,
										transition: "background-color 0.2s",
										"&:hover": {
											backgroundColor: alpha(theme.palette.background.paper, 0.5),
										},
									}}
								>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											width: 40,
											height: 40,
											borderRadius: 1,
											backgroundColor: alpha(
												getTransactionColor(item.transactionType),
												0.1,
											),
										}}
									>
										<Icon
											sx={{
												color: getTransactionColor(item.transactionType),
												fontSize: "1.25rem",
											}}
										/>
									</Box>
									<Box sx={{ flex: 1 }}>
										<Typography
											variant="body2"
											sx={{
												color: theme.palette.text.primary,
												fontWeight: 500,
												fontSize: "0.95rem",
											}}
										>
											{item.reason}
										</Typography>
										<Typography
											variant="caption"
											sx={{
												color: theme.palette.text.secondary,
												fontSize: "0.75rem",
											}}
										>
											{new Date(item.createdAt).toLocaleString()} · {item.transactionType}
										</Typography>
									</Box>
									<Typography
										variant="body1"
										sx={{
											color: isPositive
												? theme.palette.success.main
												: theme.palette.error.main,
											fontWeight: 600,
											fontSize: "1.1rem",
										}}
									>
										{amount}
									</Typography>
								</Box>
							);
						})}
					</Stack>
				) : (
					<Box sx={{ py: 4, textAlign: "center" }}>
						<Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
							No transaction history found
						</Typography>
					</Box>
				)}
			</DialogContent>
		</Dialog>
	);
};
