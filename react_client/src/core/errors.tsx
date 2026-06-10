export class AppError extends Error {
    static defaultMessage = "Application Error"
    static statusCode = 500

    statusCode: number
    details?: Record<string, any>

    constructor(details: Record<string, any>  = {}) {
        const cls = new.target as typeof AppError
        super(cls.defaultMessage)
        this.name = cls.name
        this.message = cls.defaultMessage
        this.statusCode = cls.statusCode
        this.details = details
    }   
    
    toString() {
        return `${this.name}: ${this.message} | ${JSON.stringify(this.details)}`
    }
}

export class AppValidationError extends AppError {
    static defaultMessage = "Validation failed"
    static statusCode = 400
}

export class ServerError extends AppError {
    static defaultMessage = "Server error"
    static statusCode = 500
}
