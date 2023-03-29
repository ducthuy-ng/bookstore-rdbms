export class DbEnvironmentVarMissing implements Error {
  name = 'DBEnvironmentVariableMissing';
  message =
    '`DB_TYPE` has not been set. Its value must be a string of `postgres` or `hbase` (case-insensitive)';
}

export class InvalidDatabaseTypeString implements Error {
  name = 'InvalidDatabaseTypeString';
  message = 'Database Type must be a string of `postgres` or `hbase` (case-insensitive)';
}

export class DbBuilderEnvVarsNotSet implements Error {
  name = 'DatabaseBuilderEnvironmentVariablesNotSet';
  message =
    'Database Builder Environment Variables has not been set. Use setEnvironmentVariables(process.env)';
}

export class InvalidEnvVariable implements Error {
  name = 'DatabaseBuilderEnvironmentVariablesNotSet';
  message: string;
  constructor(variableName: string) {
    this.message = `Environment variable is in invalid format or missing: ${variableName}`;
  }
}

export class FailedToCreateDb implements Error {
  name = 'FailedToCreateDb';
  message: string;

  constructor(detail: string) {
    this.message = `Failed to create DB instance: ${detail}`;
  }
}
