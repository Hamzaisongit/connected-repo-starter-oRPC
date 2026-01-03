/**
 * Common units for supplements and medications
 */
export const SUPPLEMENT_UNITS = [
	"mg", // milligrams
	"g", // grams
	"mcg", // micrograms
	"IU", // International Units
	"capsules",
	"tablets",
	"ml", // milliliters
	"fl oz", // fluid ounces
	"drops",
	"sprays",
	"pills",
	"units",
	"Other", // Allow custom input
] as const;

export type SupplementUnit = typeof SUPPLEMENT_UNITS[number];