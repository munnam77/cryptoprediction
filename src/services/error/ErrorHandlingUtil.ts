export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function handleUnknownError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      500,
      { originalError: error }
    );
  }

  return new AppError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    500,
    { originalError: error }
  );
}

export function handleServiceError(error: unknown, service: string, operation: string): AppError {
  const appError = handleUnknownError(error);
  appError.code = `${service.toUpperCase()}_${operation.toUpperCase()}_ERROR`;
  return appError;
}