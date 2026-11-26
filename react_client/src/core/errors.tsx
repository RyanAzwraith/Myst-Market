
type ExceptionData = {
    message?: string|null 
    statusCode?: number|null, 
    details?: Record<string, any>|null
}

export class AppException extends Error {
    static defaultMessage = "Application Error"
    static statusCode = 500

    statusCode: number
    details?: Record<string, any>

    constructor(data:ExceptionData) {
        const cls = new.target as typeof AppException
        super(data.message || cls.defaultMessage)
        this.name = cls.name
        this.message = data.message || cls.defaultMessage
        this.statusCode = data.statusCode || cls.statusCode
        this.details = data.details || {}
    }   
    
    toString() {
        return `${this.name}: ${this.message} | ${JSON.stringify(this.details)}`
    }
}

export class AppValidationException extends AppException {
    static defaultMessage = "Validation failed"
    static statusCode = 400
}

export class ServerException extends AppException {
    static defaultMessage = "Server error"
    static statusCode = 500
}
