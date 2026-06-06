export class AppError extends Error {
    static defaultMessage = "Application Error"
    static statusCode = 500

    statusCode: number
    details?: Record<string, any>

    constructor({ details = {} }: { details?: Record<string, any> } = {}) {
        const cls = new.target as typeof AppError
        super(cls.defaultMessage)
        this.name = cls.name
        this.message = cls.defaultMessage
        this.statusCode = cls.statusCode
        this.details = details
    }   
}

export class ValidationError extends AppError {
    static defaultMessage = "Validation failed"
    static statusCode = 400
}
