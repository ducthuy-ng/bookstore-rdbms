import { IDatabase } from '../core/IDatabase';
import { HBaseDB } from './HBase';

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

class InvalidEnvVariable implements Error {
  name = 'Database Builder Environment Variables Not Set';
  message: string;
  constructor(variableName: string) {
    this.message = `Environment variable is in invalid format or missing: ${variableName}`;
  }
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

  async getDatabaseInstance(): Promise<IDatabase> {
    if (!this.envVars) {
      throw DbBuilderEnvVarsNotSet;
    }

    let newDbInstance: IDatabase;
    if (this.envVars.HBASE_HOSTNAME === undefined) {
      throw new InvalidEnvVariable('BASE_HOMENAME');
    }

    if (this.envVars.HBASE_PORT === undefined) {
      throw new InvalidEnvVariable('HBASE_PORT');
    }

    const portNumber = parseInt(this.envVars.HBASE_PORT);
    if (isNaN(portNumber)) {
      throw new InvalidEnvVariable('HBASE_PORT');
    }

    if (this.databaseType === 'hbase') {
      newDbInstance = await HBaseDB.createInstance(this.envVars.HBASE_HOSTNAME, portNumber);
    } else {
      newDbInstance = await HBaseDB.createInstance(this.envVars.HBASE_HOSTNAME, portNumber);
    }

    return newDbInstance;
  }
}
