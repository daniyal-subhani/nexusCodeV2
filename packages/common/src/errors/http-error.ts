export interface HttpErrorOptions {
  cause?: unknown;
  details?: Record<string, unknown>;
}

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(statusCode: number, message: string, options?: HttpErrorOptions) {
    super(message, { cause: options?.cause });
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = options?.details;

    // Maintain proper stack trace in V8 environments (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }
}

// Pre-defined Http Errors
export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found', options?: HttpErrorOptions) {
    super(404, message, options);
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad request', options?: HttpErrorOptions) {
    super(400, message, options);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized access', options?: HttpErrorOptions) {
    super(401, message, options);
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends HttpError {
  constructor(message = 'Validation Error', details?: Record<string, unknown>) {
    super(422, message, { details });
    this.name = 'ValidationError';
  }
}
