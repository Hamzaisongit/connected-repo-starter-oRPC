import { Chip } from "@connected-repo/ui-mui/data-display/Chip";
import { MaterialReactTable } from "@connected-repo/ui-mui/mrt/MaterialReactTable";
import type { userStackSelectAllZod } from "@connected-repo/zod-schemas/user_stack.zod";
import type { MRT_ColumnDef } from "material-react-table";
import { useCallback, useMemo } from "react";
import type { z } from "zod";

type UserStack = z.infer<typeof userStackSelectAllZod>;

interface UserStackTableViewProps {
	stacks: UserStack[];
	onStackClick: (stackId: string) => void;
}

export function UserStackTableView({ stacks, onStackClick }: UserStackTableViewProps) {
	const formatDays = useCallback((days: string | string[]) => {
		const daysArray = Array.isArray(days) ? days : [days];
		if (daysArray.length === 7) return "Every day";
		if (daysArray.length === 0) return "No schedule";
		return daysArray.slice(0, 3).join(", ") + (daysArray.length > 3 ? "..." : "");
	}, []);

  const formatTime = useCallback((timeString: string) => {
    return timeString.slice(0, 5); // Extract HH:MM from HH:MM:SS
  }, []);

	const columns = useMemo<MRT_ColumnDef<UserStack>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Name",
				size: 200,
			},
			{
				accessorKey: "isActive",
				header: "Status",
				size: 100,
				Cell: ({ cell }) => (
					<Chip
						label={cell.getValue<boolean>() ? "Active" : "Inactive"}
						color={cell.getValue<boolean>() ? "success" : "default"}
						size="small"
						sx={{ fontWeight: 600 }}
					/>
				),
			},
			{
				accessorFn: (row) => `${row.dosage} ${row.unit}`,
				header: "Dosage",
				size: 120,
			},
			{
				accessorKey: "reminderDays",
				header: "Days",
				size: 150,
				Cell: ({ cell }) => formatDays(cell.getValue<string[]>()),
			},
			{
				accessorFn: (row) => formatTime(row.reminderTime),
				header: "Time",
				size: 100,
			},
			{
				accessorKey: "instructions",
				header: "Instructions",
				size: 250,
				Cell: ({ cell }) => {
					const instructions = cell.getValue<string[]>();
					if (!instructions || instructions.length === 0) return "-";
					const preview = instructions.slice(0, 2).join(", ");
					return preview.length > 50 ? `${preview.substring(0, 50)}...` : preview;
				},
			},
		],
		[formatDays, formatTime],
	);

	return (
		<MaterialReactTable
			columns={columns}
			data={stacks}
			enableColumnActions={false}
			enableColumnFilters={false}
			enableSorting={true}
			enableDensityToggle={false}
			enableFullScreenToggle={false}
			enableHiding={false}
			initialState={{
				density: "comfortable",
				sorting: [{ id: "name", desc: false }],
			}}
			muiTableBodyRowProps={({ row }) => ({
				onClick: () => onStackClick(row.original.id),
				sx: {
					cursor: "pointer",
					transition: "background-color 0.2s ease-in-out",
					"&:hover": {
						backgroundColor: "action.hover",
					},
				},
			})}
			muiTablePaperProps={{
				sx: {
					border: "1px solid",
					borderColor: "divider",
					boxShadow: "none",
				},
			}}
		/>
	);
}