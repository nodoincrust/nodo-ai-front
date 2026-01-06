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

        // Company
        COMPANY_SAVED_SUCCESSFULLY: "Company saved successfully.",
        COMPANY_DELETED_SUCCESSFULLY: "Company deleted successfully",
        // Department
        DEPARTMENT_CREATED_SUCCESSFULLY: "Department created successfully.",
        DEPARTMENT_UPDATED_SUCCESSFULLY: "Department updated successfully.",
        DEPARTMENT_DELETED_SUCCESSFULLY: "Department deleted successfully.",
    },

    ERRORS: {
        // Common
        SOMETHING_WENT_WRONG: "Something went wrong.",

        // Login
        EMAIL_REQUIRED: "Email address is required",
        INVALID_EMAIL: "Invalid email address format",
        ENTER_VALID_EMAIL: "Enter a valid email address",
        FAILED_TO_SEND_OTP: "Failed to send OTP",

        // OTP Verification
        INVALID_OTP: "Please enter a valid 4-digit OTP",
        OTP_VERIFICATION_FAILED: "OTP verification failed",
        MISSING_EMAIL_OR_ID: "Email or OTP ID is missing",
        TOKEN_NOT_FOUND: "Token not found",
        INVALID_TOKEN: "Invalid token",

        //Reset Password
        PASSWORD_REQUIRED: "Password is required.",
        PASSWORD_MIN_LENGTH: "Password must be at least {min} characters long.",
        PASSWORD_COMPLEXITY: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        PASSWORD_NO_SPACES: "Password cannot contain spaces.",
        CONFIRM_PASSWORD_REQUIRED: "Confirm Password is required.",
        PASSWORDS_DO_NOT_MATCH: "Both passwords must match.",
        // TOKEN_NOT_FOUND: "Reset link was not found",
        TOKEN_EXPIRED: "Your reset link has expired.",
        TOKEN_ALREADY_USED: "This reset link has already been used.",
        FAILED_TO_RESET_PASSWORD: "Failed to reset password.",
        EMAIL_FETCH_FAILED: "Failed to fetch email.",

        //Filters
        FILTERS_FETCH_FAILED: "Failed to fetch filter options.",

        // Company
        FAILED_TO_FETCH_COMPANIES: "Failed to fetch companies",
        COMPANY_SAVED_FAILED: "Failed to save company.",
        COMPANY_DELETE_FAILED: "Failed to delete company.",
        CONTACT_NUMBER_REQUIRED: "Phone number is required",
        COMPANY_NAME_REQUIRED: "Company name is required",
        CONTACT_NAME_REQUIRED: "Contact name is required",
        STORAGE_REQUIRED: "Storage is required",
        INVALID_CONTACT_NUMBER: "Enter a valid 10 digits phone number",
        INVALID_STORAGE: "Enter a valid storage value (greater than 0)",
        ONLY_NUMBERS_ALLOWED: "Only numbers allowed",
        // Department
        FAILED_TO_FETCH_DEPARTMENTS: "Failed to fetch departments.",
        // Department
        DEPARTMENT_CREATE_FAILED: "Failed to create department.",
        DEPARTMENT_UPDATE_FAILED: "Failed to update department.",
        DEPARTMENT_DELETE_FAILED: "Failed to delete department.",
        DEPARTMENT_NAME_REQUIRED: "Department name is required.",
        INVALID_DEPARTMENT_STORAGE: "Enter a valid department storage value.",

        //Employees
        FAILED_TO_FETCH_EMPLOYEES: "Failed to fetch employees.",

    },
};
