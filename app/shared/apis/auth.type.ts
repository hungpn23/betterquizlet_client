export type TokenPairResponse = {
	accessToken: string;
	refreshToken: string;
};

export type ConfirmEmailVerificationResponse = {
	verifiedToken: string;
};

export type SignUpState = {
	email: string;
	otp: string;
	username: string;
	password: string;
	isRequested: boolean;
	isEmailVerified: boolean;
	verifiedToken: string;
};
