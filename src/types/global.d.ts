type ErrorMessage = string | null;

type ErrorMessageLevel = 'basic' | 'extended' | 'technical';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
type ErrorMessageCause = {
    BASICErrorMessage?: string; // defaults to `BASICErrors.ILL_FORMULA`
    extendedErrorMessage?: string;
    technicalErrorMessage?: string;
};
