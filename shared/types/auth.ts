export type GoogleQueryParams = {
	client_id: string;
	redirect_uri: string;
	response_type: "code";
	scope: string;
	state?: string;
	include_granted_scopes?: "true" | "false";
	prompt?: "none" | "consent" | "select_account";
};

export type TokenPair = {
	accessToken: string;
	refreshToken: string;
};
