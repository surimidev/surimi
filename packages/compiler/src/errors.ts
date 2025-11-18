export class CompilerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly filePath?: string,
  ) {
    super(message);
    this.name = 'CompilerError';
  }
}

export class ValidationError extends CompilerError {
  constructor(message: string, filePath?: string) {
    super(message, 'VALIDATION_ERROR', filePath);
    this.name = 'ValidationError';
  }
}

export class ExecutionError extends CompilerError {
  constructor(message: string, filePath?: string) {
    super(message, 'EXECUTION_ERROR', filePath);
    this.name = 'ExecutionError';
  }
}

export class BuildError extends CompilerError {
  constructor(message: string, filePath?: string) {
    super(message, 'BUILD_ERROR', filePath);
    this.name = 'BuildError';
  }
}
