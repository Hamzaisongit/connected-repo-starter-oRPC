import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { SuccessAlert } from "@connected-repo/ui-mui/components/SuccessAlert";
import { useRhfForm } from "@connected-repo/ui-mui/rhf-form/useRhfForm";
import type { DaysOfWeek } from "@connected-repo/zod-schemas/enums.zod";
import { orpc, orpcFetch } from "@frontend/utils/orpc.client";
import { SUPPLEMENT_UNITS } from "@frontend/utils/supplement.constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import z from "zod";
import { UserStackFormFields } from "./UserStackFormFields";

const editUserStackFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	instructions: z.array(z.object({ value: z.string() })),
	isActive: z.boolean(),
	dosage: z.string().min(1, "Dosage is required"),
	unit: z.enum(SUPPLEMENT_UNITS),
	customUnit: z.string().optional(),
	days: z.array(z.string()).min(1, "Select at least one day"),
	timesOfDay: z.array(z.object({ 
		hour: z.string().min(1, "Hour is required").refine((val) => {
			const num = Number.parseInt(val);
			return num >= 1 && num <= 12;
		}, "Hour must be 1-12"),
		minute: z.string().min(1, "Minute is required").refine((val) => {
			const num = Number.parseInt(val);
			return num >= 0 && num <= 59;
		}, "Minute must be 0-59"),
		period: z.enum(["AM", "PM"]),
	})).min(1, "Add at least one time"),
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

type EditUserStackFormData = z.infer<typeof editUserStackFormSchema>;

interface EditUserStackFormProps {
	stackId: string;
}

export function EditUserStackForm({ stackId }: EditUserStackFormProps) {
	const navigate = useNavigate();
	const [success, setSuccess] = useState("");
	
	const { data: userStack, isLoading } = useQuery(
		orpc.userStacks.getById.queryOptions({ input: { id: stackId } })
	);

	// Wrap onSubmit in useCallback to prevent recreating the function on every render
	// This is critical because the function is passed to useRhfForm which memoizes the provider
	const onSubmit = useCallback(async (data: EditUserStackFormData) => {
			const instructions: string[] = data.instructions
				.map((i) => i.value.trim())
				.filter((i) => i);
			
			const timesOfDay: string[] = data.timesOfDay
				.map((t) => {
					const hour = Number.parseInt(t.hour);
					const minute = t.minute.padStart(2, "0");
					let hour24 = hour;
					
					if (t.period === "PM" && hour !== 12) {
						hour24 = hour + 12;
					} else if (t.period === "AM" && hour === 12) {
						hour24 = 0;
					}
					
					return `${hour24.toString().padStart(2, "0")}:${minute}`;
				})
				.filter((t) => t);

			const finalUnit = data.unit === "Other" ? data.customUnit : data.unit;

			const submitData = {
				id: stackId,
				name: data.name,
				isActive: data.isActive,
				dosage: Number(data.dosage),
				unit: finalUnit || "",
				instructions,
				timesOfDay,
				days: data.days as DaysOfWeek[],
				imageUrl: data.imageUrl || null,
			};
			await orpcFetch.userStacks.update(submitData);
			setSuccess("Supplement updated successfully!");
			setTimeout(() => {
				setSuccess("");
				navigate(`/user-stack/${stackId}`);
			}, 1500);
		}, [stackId, navigate]);

	const { formMethods, RhfFormProvider } = useRhfForm<EditUserStackFormData>({
		onSubmit,
		formConfig: {
			resolver: zodResolver(editUserStackFormSchema),
			defaultValues: {
				name: "",
				instructions: [{ value: "" }],
				isActive: true,
				dosage: "1",
				unit: "mg",
				customUnit: "",
				days: [],
				timesOfDay: [{ hour: "08", minute: "00", period: "AM" }],
				imageUrl: undefined,
			},
		},
	});

	// Update form values when userStack data is loaded
	useEffect(() => {
		if (userStack) {
			// Convert times from 24-hour format (HH:MM) to 12-hour format with period
			const convertedTimes = userStack.timesOfDay.map(time => {
				const [hours, minutes] = time.split(":");
				const hour24 = Number.parseInt(hours || "0", 10);
				const minute = minutes || "00";
				
				let period: "AM" | "PM" = "AM";
				let hour12 = hour24;
				
				if (hour24 >= 12) {
					period = "PM";
					if (hour24 > 12) {
						hour12 = hour24 - 12;
					}
				} else if (hour24 === 0) {
					hour12 = 12;
				}
				
				return {
					hour: hour12.toString().padStart(2, "0"),
					minute,
					period,
				};
			});

			// Check if unit is a standard one or custom
			const isStandardUnit = SUPPLEMENT_UNITS.includes(userStack.unit as typeof SUPPLEMENT_UNITS[number]);
			
			formMethods.reset({
				name: userStack.name,
				instructions: userStack.instructions.length > 0 
					? userStack.instructions.map(i => ({ value: i }))
					: [{ value: "" }],
				isActive: userStack.isActive,
				dosage: userStack.dosage.toString(),
				unit: isStandardUnit ? userStack.unit as typeof SUPPLEMENT_UNITS[number] : "Other",
				customUnit: isStandardUnit ? "" : userStack.unit,
				days: userStack.days,
				timesOfDay: convertedTimes,
				imageUrl: userStack.imageUrl || undefined,
			});
		}
	}, [userStack, formMethods]);

	if (isLoading) {
		return <LoadingSpinner text="Loading supplement..." />;
	}

	return (
		<RhfFormProvider>
			<UserStackFormFields 
				formMethods={formMethods}
				submitButtonText="Update Supplement"
				submittingText="Updating..."
			/>
			<SuccessAlert message={success} />
		</RhfFormProvider>
	);
}
