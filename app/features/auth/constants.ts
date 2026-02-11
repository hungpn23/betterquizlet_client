import type { AuthFormField, ButtonProps } from "@nuxt/ui";
import * as v from "valibot";
import type { AuthField, ProviderId } from "./types";

export const DEFAULT_FIELDS: AuthFormField[] = [
	{
		name: "email" satisfies AuthField,
		type: "email" as const,
		label: "Email",
		placeholder: "Enter your email",
		required: true,
	},
	{
		name: "password" satisfies AuthField,
		label: "Password",
		type: "password" as const,
		placeholder: "Enter your password",
		required: true,
	},
	{
		name: "confirmPassword" satisfies AuthField,
		label: "Confirm password",
		type: "password" as const,
		placeholder: "Enter your confirm password",
		required: true,
	},
] as const;

export const AUTH_PROVIDERS: (ButtonProps & { id: ProviderId })[] = [
	{
		id: "google" satisfies ProviderId,
		label: "Continue with Google",
		icon: "i-simple-icons-google",
	},
	{
		id: "github" satisfies ProviderId,
		label: "Continue with GitHub",
		icon: "i-simple-icons-github",
	},
	{
		id: "magic-link" satisfies ProviderId,
		label: "Continue with Email",
		icon: "i-simple-icons-simplelogin",
	},
] as const;

export const AUTH_SCHEMA = v.object({
	email: v.message(
		v.pipe(v.string(), v.email()),
		"Please enter a valid email address.",
	),
	password: v.message(
		v.pipe(
			v.string(),
			v.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&*@^]).{8,}$/),
		),
		"Password must contain at least 8 characters, including uppercase, lowercase, number, and special characters.",
	),
	confirmPassword: v.pipe(v.string()),
});
