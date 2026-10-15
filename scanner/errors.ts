export interface ScannerErrorOptions extends ErrorOptions {
    //
}

export class ScannerError extends Error
{
    constructor(message?: string, options: ScannerErrorOptions = {})
    {
        super(message, options);

        this.name = this.constructor.name;
    }
}
