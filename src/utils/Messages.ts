// ===============================
// All Application Messages
// ===============================

export const MESSAGES = {
    SUCCESS: {
        // Login
        OTP_SENT: "OTP sent on",

        // OTP Verification
        OTP_VERIFIED: "OTP verified successfully.",
        OTP_RESENT: "OTP resent to",

        //Password Reset
        PASSWORD_RESET_SUCCESS: 'Password reset successfully.',

    },

    ERRORS: {
        // Common
        SOMETHING_WENT_WRONG: "Something went wrong.",

        // Login
        EMAIL_REQUIRED: "Email is required",
        INVALID_EMAIL: "Invalid email format",
        FAILED_TO_SEND_OTP: "Failed to send OTP",

        // OTP Verification
        INVALID_OTP: "Please enter a valid 6-digit OTP",
        OTP_VERIFICATION_FAILED: "OTP verification failed",
        MISSING_EMAIL_OR_ID: "Email or OTP ID is missing",

        //Reset Password
        PASSWORD_REQUIRED: "Password is required.",
        PASSWORD_MIN_LENGTH: "Password must be at least {min} characters long.",
        PASSWORD_COMPLEXITY: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        PASSWORD_NO_SPACES: "Password cannot contain spaces.",
        CONFIRM_PASSWORD_REQUIRED: "Confirm Password is required.",
        PASSWORDS_DO_NOT_MATCH: "Both passwords must match.",
        TOKEN_NOT_FOUND: "Reset link was not found",
        TOKEN_EXPIRED: "Your reset link has expired.",
        TOKEN_ALREADY_USED: "This reset link has already been used.",
        FAILED_TO_RESET_PASSWORD: "Failed to reset password.",
        EMAIL_FETCH_FAILED: "Failed to fetch email.",
        
        //Filters
        FILTERS_FETCH_FAILED: "Failed to fetch filter options."
    },
};
