const PEDANTIC = true;

// Limitations on BASIC
// for more information, see Dartmouth BASIC manual, APPENDIX A and APPENDIX B
export const MAX_CONSTANT_LENGTH = PEDANTIC ? 9 : Number.MAX_SAFE_INTEGER;
export const MAX_LINE_NUMBER = PEDANTIC ? 99999 : Number.MAX_SAFE_INTEGER;

export const MAX_PROGRAM_LENGTH = undefined; // Not applicable
export const MAX_CONSTANTS_LABELS = PEDANTIC ? 175 : Number.MAX_SAFE_INTEGER;
export const MAX_DATA = PEDANTIC ? 300 : Number.MAX_SAFE_INTEGER;
export const MAX_LABELS_LENGTH = PEDANTIC ? 599 : Number.MAX_SAFE_INTEGER;
export const MAX_FOR_STM = PEDANTIC ? 26 : Number.MAX_SAFE_INTEGER;
export const MAX_GOTO_IFTHEN_STM = PEDANTIC ? 80 : Number.MAX_SAFE_INTEGER;
export const MAX_LISTS_TABLES = PEDANTIC ? 1500 : Number.MAX_SAFE_INTEGER;
