import { Snackbar } from "@connected-repo/ui-mui/feedback/Snackbar";
import { useRhfForm } from "@connected-repo/ui-mui/rhf-form/useRhfForm";
import type { DaysOfWeek } from "@connected-repo/zod-schemas/enums.zod";
import type { UserStackCreateInput } from "@connected-repo/zod-schemas/user_stack.zod";
import { orpcFetch } from "@frontend/utils/orpc.client";
import { SUPPLEMENT_UNITS } from "@frontend/utils/supplement.constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import z from "zod";
import { UserStackFormFields } from "./UserStackFormFields";

const createUserStackFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	instructions: z.array(z.object({ value: z.string() })),
	isActive: z.boolean(),
	dosage: z.string().min(1, "Dosage is required"),
	unit: z.enum(SUPPLEMENT_UNITS),
	customUnit: z.string().optional(),
	reminderDays: z.array(z.string()).min(1, "Select at least one day"),
	reminderTime: z.iso.time({ precision: 0 }),
	imageUrl: z.string().url().nullable().optional(),
}).refine((data) => {
	if (data.unit === "Other" && (!data.customUnit || data.customUnit.trim() === "")) {
		return false;
	}
	return true;
}, {
	message: "Custom unit is required when 'Other' is selected",
	path: ["customUnit"],
});

type CreateUserStackFormData = z.infer<typeof createUserStackFormSchema>;

export function CreateUserStackForm() {
	const navigate = useNavigate();
	const [showToast, setShowToast] = useState(false);

	// Wrap onSubmit in useCallback to prevent recreating the function on every render
	// This is critical because the function is passed to useRhfForm which memoizes the provider
	const onSubmit = useCallback(async (data: CreateUserStackFormData) => {
			const instructions: string[] = data.instructions
				.map((i) => i.value.trim())
				.filter((i) => i);

			const finalUnit = data.unit === "Other" ? data.customUnit : data.unit;

			const submitData: UserStackCreateInput = {
				name: data.name,
				isActive: data.isActive,
				dosage: Number(data.dosage),
				unit: finalUnit || "",
				instructions,
				reminderTime: data.reminderTime,
				reminderDays: data.reminderDays as DaysOfWeek[],
				imageUrl: data.imageUrl || null,
			};
			const newStack = await orpcFetch.userStacks.create(submitData);
			setShowToast(true);
			setTimeout(() => {
				setShowToast(false);
				navigate(`/user-stack?highlight=${newStack.id}`);
			}, 1500);
		}, [navigate]);

	const { formMethods, RhfFormProvider } = useRhfForm<CreateUserStackFormData>({
		onSubmit,
		formConfig: {
			resolver: zodResolver(createUserStackFormSchema),
			defaultValues: {
				name: "",
				instructions: [{ value: "" }],
				isActive: true,
				dosage: "1",
				unit: "mg",
				customUnit: "",
				reminderDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
				reminderTime: "08:00:00",
				imageUrl: undefined,
			},
		},
	});

	return (
		<RhfFormProvider>
			<UserStackFormFields
				formMethods={formMethods}
				submitButtonText="Confirm & Activate"
				submittingText="Adding..."
			/>
			<Snackbar
				open={showToast}
				autoHideDuration={1500}
				onClose={() => setShowToast(false)}
				message="Supplement added successfully!"
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			/>
		</RhfFormProvider>
	);
}
