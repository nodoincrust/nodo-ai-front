// All Application Messages

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

        // Employees
        EMPLOYEE_CREATED_SUCCESSFULLY: "Employee added successfully.",
        EMPLOYEE_UPDATED_SUCCESSFULLY: "Employee updated successfully.",
        EMPLOYEE_DELETED_SUCCESSFULLY: "Employee deleted successfully.",

        // BOUQUETS
        BOUQUET_ADDED_SUCCESSFULLY: "Bouquet added successfully.",
        BOUQUET_UPDATED_SUCCESSFULLY: "Bouquet updated successfully.",
        BOUQUET_DELETED_SUCCESSFULLY: "Bouquet deleted successfully.",

        //Templates
        TEMPLATE_ADDED_SUCCESSFULLY: "Template added successfully.",
        TEMPLATE_UPDATED_SUCCESSFULLY: "Template updated successfully.",
        TEMPLATE_DELETED_SUCCESSFULLY: "Template deleted successfully.",
        TEMPLATE_SAVED_SUCCESSFULLY: "Template saved successfully.",
        FORM_SUBMITTED_SUCCESSFULLY: "Form submitted successfully.",
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

        //Profile
        FAILED_TO_FETCH_PROFILE: "Failed to load information. Please login again.",


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
        STORAGE_CAN_NOT_EXCEED_1024: "Storage cannot exceed 1024 GB",
        // Department
        FAILED_TO_FETCH_DEPARTMENTS: "Failed to fetch departments.",
        // Department
        DEPARTMENT_CREATE_FAILED: "Failed to create department.",
        DEPARTMENT_UPDATE_FAILED: "Failed to update department.",
        DEPARTMENT_DELETE_FAILED: "Failed to delete department.",
        DEPARTMENT_NAME_REQUIRED: "Department name is required.",
        INVALID_DEPARTMENT_STORAGE: "Enter a valid department storage value.",

        // Employees
        FAILED_TO_FETCH_EMPLOYEES: "Failed to fetch employees.",
        EMPLOYEE_CREATE_FAILED: "Failed to add employee.",
        EMPLOYEE_UPDATE_FAILED: "Failed to update employee.",
        EMPLOYEE_DELETE_FAILED: "Failed to delete employee.",
        EMPLOYEE_NAME_REQUIRED: "Employee name is required.",
        EMPLOYEE_EMAIL_REQUIRED: "Employee email address is required.",
        EMPLOYEE_ROLE_REQUIRED: "Employee role is required.",
        EMPLOYEE_DEPARTMENT_REQUIRED: "Department is required.",
        EMPLOYEE_ALREADY_EXISTS: "An employee with this email already exists.",
        ONLY_CHARS_ALLOWED: "Only characters are allowed",

        // BOUQUETS
        FAILED_TO_FETCH_BOUQUETS: "Failed to fetch bouquets.",
        BOUQUET_DELETE_FAILED: "Failed to delete bouquet.",
        BOUQUET_ADD_FAILED: "Failed to add bouquet.",
        BOUQUET_UPDATE_FAILED: "Failed to update bouquet.",
        BOUQUET_NAME_REQUIRED: "Bouquet name is required.",
        BOUQUET_DESCRIPTION_REQUIRED: "Bouquet description is required.",
        BOUQUET_STORAGE_REQUIRED: "Bouquet storage is required.",
        BOUQUET_PRICE_REQUIRED: "Bouquet price is required.",

        //Templates
        TEMPLATE_FETCH_FAILED: "Failed to fetch templates.",
        TEMPLATE_DELETE_FAILED: "Failed to delete template.",
        TEMPLATE_ADD_FAILED: "Failed to add template.",
        TEMPLATE_UPDATE_FAILED: "Failed to update template.",
        TEMPLATE_NAME_REQUIRED: "Template name is required.",
        TEMPLATE_DESCRIPTION_REQUIRED: "Template description is required.",
        LABEL_NAME_REQUIRED: "Label name is required",
        PLACEHOLDER_NAME_REQUIRED: "Placeholder name is required",
        AT_LEAST_ONE_OPTION_REQUIRED: "At least one option is required",
        PLEASE_ENTER_ERROR_MESSAGE: "Please enter the error message",
        FILL_ALL_REQUIRED_FIELDS: "Please fill all the required fields",
        INVALID_FILE_TYPE_FORMAT: "Invalid file type format. Example: .jpg, .png",
        FAILED_TO_SAVE_TEMPLATE: "Failed to save template",
        FAILED_TO_UPDATE_TEMPLATE: "Failed to update template",
        PLEASE_ADD_AT_LEAST_ONE_FIELD_BEFORE_SAVING_THE_FORM: "Please add at least one field before saving the template",
        FORM_NAME_REQUIRED: "Template name is required",
        AT_LEAST_ONE_BUTTON_REQUIRED: "At least one button is required in the template",
        AT_LEAST_ONE_FIELD_REQUIRED: "At least one field is required",
        PLEASE_FILL_AT_LEAST_ONE_FIELD: "Please fill at least one field",
    },
};
