import type { CreateCardSchema } from "~/pages/(core)/create-deck/schemas";

export const getNewCard = (): CreateCardSchema => ({
	term: "",
	definition: "",
	termLanguage: "en",
	definitionLanguage: "vi",
	examples: [""],
});
