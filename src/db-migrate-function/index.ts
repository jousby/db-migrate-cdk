import { exec } from 'child_process';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { Context } from 'aws-lambda';

/**
 * Models the AWS Secrets Manager secret created by RDS instance types
 * and Aurora clusters.
 */
type DatabaseSecret = {
  password: string;
  engine: string;
  port: number;
  dbInstanceIdentifier: string;
  host: string;
  username: string;
}

export interface DbMigrateEvent {
  /**
   * The id of the AWS Secrets Manager secret that contains both the
   * database credentials and the database connection details. It is
   * expected to conform to the RDS DatabaseSecret type modeled above.
   * The details stored in this secret are how we build the connection
   * string to use to reach the target database.
   */
  readonly dbSecretId: string;

  /**
   * The initial database to connect to.
   */
  readonly dbName: string;

  /**
   * The name of the S3 bucket that contains the sql migration scripts
   * to use.
   */
  readonly dbMigrationsBucket: string;

  /**
   * The 'migrate' command that we want to pass to the 'migrate' cli.
   */
  readonly migrateCommand: string;

  /**
   * Not used by the function itself, but a change in the hash will trigger the
   * function to be called.
   */
  readonly migrationFilesHash: string;
}

export interface DbMigrateResponse {
  results: string;
}

const secrets = new SecretsManagerClient({});

/**
 *
 * @param event Data passed into the custom resource function call
 * @param context Standard AWS Lamba context (contents varies by call)
 * @returns Output of the 'migrate' cli call
 */
export const handler = async (
  event: DbMigrateEvent,
  context: Context,
): Promise<DbMigrateResponse> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  try {
    const { dbName, dbSecretId, dbMigrationsBucket, migrateCommand } = event;

    // Run the migrate function
    const databaseSecret = await getSecretValue(dbSecretId);
    const connectionString = buildConnectionString(dbName, databaseSecret);
    const migrateOutput = await runMigrate(
      connectionString,
      dbMigrationsBucket,
      migrateCommand,
    );

    console.log(`Result: ${migrateOutput}`);

    return {
      results: migrateOutput,
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getSecretValue = async (secretId: string): Promise<DatabaseSecret> => {
  const data = await secrets.send(
    new GetSecretValueCommand({
      SecretId: secretId,
    }),
  );

  let secret = data?.SecretString;
  // Try the binary serialization option if we don't have a secret at this point
  if (!secret && data.SecretBinary) {
    const buff = Buffer.from(data.SecretBinary);
    secret = buff.toString('ascii');
  }

  if (!secret) throw new Error(`Unable to retrieve secret for secretId: ${secretId}`);
  return toType(secret, isDatabaseSecret);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toType<T>(x: string, typeGuard: (v: any) => v is T): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const j = JSON.parse(x);
  if (!typeGuard(j)) {
    throw new Error(`String conversion to json type failed for ${x}`);
  }

  return j;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isDatabaseSecret = (o: any): o is DatabaseSecret => {
  return (
    'username' in o &&
    'password' in o &&
    'host' in o &&
    'engine' in o &&
    'dbInstanceIdentifier' in o &&
    'port' in o
  );
};

const buildConnectionString = (
  dbName: string,
  databaseSecret: DatabaseSecret,
): string => {
  const { username, password, host, port, engine } = databaseSecret;

  switch (engine) {
    case 'mysql':
      return `mysql://${username}:${password}@tcp(${host}:${port})/${dbName}`;
      break;
    case 'postgres':
      return `postgres://${username}:${password}@${host}:${port}/${dbName}`;
      break;
    default:
      throw new Error(
        `Unsupported (or not yet implemented) database engine for migrate target: ${databaseSecret.engine}`,
      );
      break;
  }
};

function runMigrate(
  connectionString: string,
  bucketName: string,
  migrateCommand: string,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const cmd = `migrate -source s3://${bucketName} -database '${connectionString}' ${migrateCommand}`;
    console.log('cmd', cmd);

    const childProcess = exec(cmd);

    let output = '';
    childProcess.stdout?.on('data', (data: string) => {
      console.log(data);
    });

    // migrate currently sends all output to stderr :(
    // https://github.com/golang-migrate/migrate/issues/364
    // Revisit in v5 or whenever the above gets fixed.
    childProcess.stderr?.on('data', (data: string) => {
      console.log(data);
      output += data;
    });

    childProcess.on('close', (code) => {
      console.debug(`${cmd} exited with code ${code}`);
      if (code === 0) {
        resolve(`Migrate Success: ${output}`);
      } else {
        reject(`Migrate Failed with code: ${code} and output: ${output}`);
      }
    });
  });
}
