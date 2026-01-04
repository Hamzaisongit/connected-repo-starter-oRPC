/**
 * Utility functions for supplement-related operations
 */

/**
 * Get themed stock icon and background color based on supplement name
 */
export const getStockIconAndColor = (name: string) => {
	const lowerName = name.toLowerCase();
	if (lowerName.includes("vitamin d") || lowerName.includes("d3")) {
		return { icon: "☀️", bgColor: "#FFF8DC" }; // Light yellow for sun
	}
	if (lowerName.includes("vitamin c")) {
		return { icon: "🍊", bgColor: "#FFE4B5" }; // Light orange
	}
	if (lowerName.includes("omega") || lowerName.includes("fish")) {
		return { icon: "🐟", bgColor: "#E0F2FE" }; // Light blue for fish
	}
	if (lowerName.includes("protein") || lowerName.includes("collagen")) {
		return { icon: "🥩", bgColor: "#FFE6E6" }; // Light pink for meat
	}
	if (lowerName.includes("magnesium") || lowerName.includes("calcium")) {
		return { icon: "🪨", bgColor: "#F5F5DC" }; // Light beige for rock
	}
	if (lowerName.includes("probiotic")) {
		return { icon: "🦠", bgColor: "#E8F5E8" }; // Light green
	}
	if (lowerName.includes("herb") || lowerName.includes("ashwagandha") || lowerName.includes("ginseng")) {
		return { icon: "🌿", bgColor: "#F0FFF0" }; // Light mint
	}
	if (lowerName.includes("oil") || lowerName.includes("cbd")) {
		return { icon: "💧", bgColor: "#F0F8FF" }; // Light blue for oil
	}
	return { icon: "💊", bgColor: "#F8F9FA" }; // Default light grey
};