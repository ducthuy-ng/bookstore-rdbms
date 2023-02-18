import { IDatabase } from '../core/IDatabase';
import { HBaseDB } from './hbase';

class DbEnvironmentVarMissing implements Error {
  name = 'DB Environment Variable Missing';
  message =
    '`DB_TYPE` has not been set. Its value must be a string of `postgres` or `hbase` (case-insensitive)';
}

class InvalidDatabaseTypeString implements Error {
  name = 'Invalid Database Type String';
  message = 'Database Type must be a string of `postgres` or `hbase` (case-insensitive)';
}

class DbBuilderEnvVarsNotSet implements Error {
  name = 'Database Builder Environment Variables Not Set';
  message =
    'Database Builder Environment Variables has not been set. Use setEnvironmentVariables(process.env)';
}

export class DatabaseBuilder {
  private databaseType = 'hbase';
  private envVars: NodeJS.ProcessEnv | undefined = undefined;

  setEnvironmentVariables(environmentVariable: NodeJS.ProcessEnv) {
    if (!environmentVariable.DB_TYPE) {
      throw new DbEnvironmentVarMissing();
    }

    const lowercaseDbType = environmentVariable.DB_TYPE.toLowerCase();

    if (lowercaseDbType !== 'postgres' && lowercaseDbType !== 'hbase') {
      throw new InvalidDatabaseTypeString();
    }

    this.databaseType = environmentVariable.DB_TYPE.toLowerCase();
    this.envVars = environmentVariable;
  }

  getDatabaseInstance(): IDatabase {
    if (!this.envVars) {
      throw DbBuilderEnvVarsNotSet;
    }

    let newDbInstance: IDatabase;

    if (this.databaseType === 'hbase') {
      newDbInstance = new HBaseDB(this.envVars.HBASE_HOSTNAME, this.envVars.HBASE_PORT);
    } else {
      newDbInstance = new HBaseDB(this.envVars.HBASE_HOSTNAME, this.envVars.HBASE_PORT);
    }

    return newDbInstance;
  }
}
