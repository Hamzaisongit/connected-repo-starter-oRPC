import { SuccessAlert } from "@connected-repo/ui-mui/components/SuccessAlert";
import { useRhfForm } from "@connected-repo/ui-mui/rhf-form/useRhfForm";
import type { DaysOfWeek } from "@connected-repo/zod-schemas/enums.zod";
import type { UserStackCreateInput } from "@connected-repo/zod-schemas/user_stack.zod";
import { orpcFetch } from "@frontend/utils/orpc.client";
import { SUPPLEMENT_UNITS } from "@frontend/utils/supplement.constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
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
	reminderTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format"),
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
	const [success, setSuccess] = useState("");
	
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
			await orpcFetch.userStacks.create(submitData);
			setSuccess("User stack item added successfully!");
			setTimeout(() => setSuccess(""), 3000);
		}, []);

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
				reminderDays: [],
				reminderTime: "08:00",
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
			<SuccessAlert message={success} />
		</RhfFormProvider>
	);
}
