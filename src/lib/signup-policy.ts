// Set ALLOW_OPEN_SIGNUP=false to require an invitation or an approved access request.
export const openSignupAllowed = () => process.env.ALLOW_OPEN_SIGNUP !== "false";
