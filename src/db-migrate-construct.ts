import {
  Duration,
  Token,
  aws_ec2 as ec2,
  aws_ecr_assets as ecr_assets,
  aws_lambda as lambda,
  custom_resources as custom,
  aws_logs as logs,
  aws_iam as iam,
  aws_rds as rds,
  aws_s3 as s3,
  aws_s3_assets as s3_assets,
  aws_s3_deployment as s3_deployment,
  aws_secretsmanager as secrets_manager,
} from 'aws-cdk-lib';
import { Construct, IDependable } from 'constructs';

export interface DbMigrateEvent {
  /**
   * The id of the AWS Secrets Manager secret that contains both the
   * database credentials and the database connection details. It is
   * expected to conform to the RDS DatabaseSecret type modeled above.
   * The details stored in this secret are how we build the connection
   * string to use to reach the target database.
   */
  dbSecretId: string;

  /**
   * The initial database to connect to.
   */
  dbName: string;

  /**
   * The name of the S3 bucket that contains the sql migration scripts
   * to use.
   */
  dbMigrationsBucket: string;

  /**
   * The 'migrate' command that we want to pass to the 'migrate' cli.
   */
  migrateCommand: string;

  /**
   * Not used by the function itself, but a change in the hash will trigger the
   * function to be called.
   */
  migrationFilesHash: string;
}

/**
 * Defines the possible commands you can pass to the 'migrate' cli
 */
export enum DbMigrateCommand {
  /**
   * Will instruct migrate to move the schema evolutions forward as far
   * as possible or to the specified version.
   */
  UP = 'up',

  /**
   * Will instruct migrate to move the schema evolutions back as far
   * as possible or to the specified version.
   */
  DOWN = 'down',

  /**
   * Will instruct migrate to move the schema evolutions to the specified version.
   */
  GOTO = 'goto',

  /**
   * Drop everything in the database
   */
  DROP = 'drop',

  /**
   * Set version to specified version but don't run migration
   */
  FORCE = 'force',

  /**
   * Prints the currently applied schema version
   */
  VERSION = 'version',
}

export interface DbMigrateProps {
  /**
   * The target RDS instance or Aurora cluster to run the migrations
   * against.
   */
  targetDatabaseInstance: rds.DatabaseInstance | rds.DatabaseCluster;

  /**
   * The target database in the target instance/cluster to initially connect to.
   */
  targetDatabaseName: string;

  /**
   * If you want to use an alternate set of db credentials to access the
   * database to the one associated with the instance then pass it here.
   *
   * @default targetDatabase.secret
   */
  dbCredentialsSecret?: secrets_manager.ISecret;

  /**
   * The local folder containing the sql migration scripts to be used by
   * the 'migrate' cli command. These scripts will first be uploaded to
   * S3 where they will be access by the lambda function running the migrate
   * cli.
   */
  migrationsFolder: string;

  /**
   * The migrate command that the 'migrate cli' will run.
   * @default DbMigrateCommand.UP
   */
  migrateCommand?: DbMigrateCommand;

  /**
   * Some migrate commands accept an optional second argument for the target
   * schema version to move to.
   */
  targetSchemaVersion?: number;

  /**
   * The vpc to define the custom resource lambda function in.
   */
  vpc: ec2.IVpc;

  /**
   * Which subnets from the VPC to place the lambda functions in.
   *
   * Note: internet access for Lambdas
   * requires a NAT gateway, so picking Public subnets is not allowed.
   *
   * @default - the Vpc default strategy if not specified
   */
  subnetSelection?: ec2.SubnetSelection;

  /**
   * Security groups to attach to the lambda function.
   *
   * @default - a dedicated security group is created for each function.
   */
  securityGroups?: ec2.ISecurityGroup[];

  /**
   * @default Duration.minutes(14)
   */
  eventHandlerTimeout?: Duration;

  /**
   * @default Retention.ONE_YEAR
   */
  eventHandlerLogRetention?: logs.RetentionDays;

  /**
   * @default 128
   */
  eventHandlerMemorySize?: number;

  /**
   * @default Duration.minutes(14)
   */
  providerTotalTimeout?: Duration;

  /**
   * @default Retention.ONE_YEAR
   */
  providerLogRetention?: logs.RetentionDays;
}

/**
 * A high level construct for running  the [migrate]() based migration scripts against an
 * AWS RDS Instance or Aurora cluster.
 *
 * NOTE: It wouldn't take a lot to extend this to support the other
 * database targets that 'migrate' supports if required.
 */
export class DbMigrate extends Construct implements ec2.IConnectable, iam.IGrantable {
  public readonly response: string;
  public connections: ec2.Connections;
  public grantPrincipal: iam.IPrincipal;

  private resource: custom.AwsCustomResource;
  private onEventHandler: lambda.DockerImageFunction;

  constructor(scope: Construct, id: string, props: DbMigrateProps) {
    super(scope, id);

    const dbPort = this.getPort(props);
    const dbSecretId = this.getSecretId(props);
    const migrateCommand = this.getMigrateCommand(props);

    const code = lambda.DockerImageCode.fromImageAsset(
      `${__dirname}/db-migrate-function`,
      {
        platform: ecr_assets.Platform.LINUX_ARM64,
      },
    );

    this.onEventHandler = new lambda.DockerImageFunction(this, 'DbMigrateEventHandler', {
      code,
      memorySize: props.eventHandlerMemorySize || 128,
      timeout: props.eventHandlerTimeout || Duration.minutes(14),
      logRetention: props.eventHandlerLogRetention || logs.RetentionDays.ONE_YEAR,
      vpc: props.vpc,
      vpcSubnets: props.vpc.selectSubnets(props.subnetSelection),
      securityGroups: props.securityGroups,
      architecture: lambda.Architecture.ARM_64,
    });

    this.connections = this.onEventHandler.connections;
    this.grantPrincipal = this.onEventHandler.grantPrincipal;

    // Upload the migration files to S3
    const migrationsFolder = s3_deployment.Source.asset(props.migrationsFolder);
    const migrationsBucket = new s3.Bucket(this, 'DbMigrateCDKTestMigrationsBucket');
    const migrationsDeployment = new s3_deployment.BucketDeployment(
      this,
      'MigrationDeployment',
      {
        sources: [migrationsFolder],
        destinationBucket: migrationsBucket,
      },
    );

    // The deployment construct conveniently does a folder level hash for us that we
    // can use to trigger a run of the migrate function if somethings has changed.
    const s3AssetHash = (migrationsDeployment.node.findChild('Asset1') as s3_assets.Asset)
      .assetHash;

    // NOTE: This is probably the least intuitive part of the solution. By default the custom
    // resource will run the first time it is created. It will only run again if the parameters
    // listed here change in some way. For this usecase we would like to re run the function
    // whenever the following changes happen:
    //     - The sql migration files change
    //     - The migrate lambda function is changed
    // Passing the migration files hash here, even thoughh its not used by the function triggers
    // the function to be called if the value changes.
    const event: DbMigrateEvent = {
      dbSecretId: dbSecretId.secretName,
      dbName: props.targetDatabaseName,
      dbMigrationsBucket: migrationsBucket.bucketName,
      migrateCommand: migrateCommand,
      migrationFilesHash: s3AssetHash,
    };

    const eventString = JSON.stringify(event);

    const sdkCall: custom.AwsSdkCall = {
      service: 'Lambda',
      action: 'invoke',
      parameters: {
        FunctionName: this.onEventHandler.functionName,
        Payload: eventString,
      },
      physicalResourceId: custom.PhysicalResourceId.of(
        `${id}-AwsSdkCall-${this.onEventHandler.currentVersion.version}`,
      ),
    };

    const customResourceFnRole = new iam.Role(this, 'DbMigrateCustomResourceRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaVPCAccessExecutionRole',
        ),
      ],
    });
    customResourceFnRole.addToPolicy(
      new iam.PolicyStatement({
        resources: [this.onEventHandler.functionArn],
        actions: ['lambda:InvokeFunction'],
      }),
    );
    customResourceFnRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        sid: 'AllowEc2',
        resources: ['*'],
        actions: [
          'ec2:CreateNetworkInterface',
          'ec2:DescribeNetworkInterfaces',
          'ec2:DeleteNetworkInterface',
        ],
      }),
    );

    this.resource = new custom.AwsCustomResource(this, 'DbMigrateCustomResource', {
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: custom.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
      onUpdate: sdkCall,
      timeout: Duration.minutes(14),
      role: customResourceFnRole,
      logRetention: props.providerLogRetention || logs.RetentionDays.ONE_YEAR,
      vpc: props.vpc,
      vpcSubnets: props.vpc.selectSubnets(props.subnetSelection),
    });

    // allow the event handler function to connect to the RDS instance
    props.targetDatabaseInstance.connections.allowFrom(
      this.onEventHandler,
      ec2.Port.tcp(Token.asNumber(dbPort)),
    );

    // allow event handler function to read RDS instance creds secret
    dbSecretId.grantRead(this.onEventHandler);

    // allow the event handler to read the s3 migrations bucket
    migrationsBucket.grantRead(this.onEventHandler);

    // add dependency on the target database for this custom resource
    this.resource.node.addDependency(props.targetDatabaseInstance);

    this.response = this.resource.getResponseField('Payload');
  }

  addDependency(...deps: IDependable[]) {
    this.resource.node.addDependency(deps);
  }

  /**
   * If the user hasn't speficifed their own credentials then default to the
   * credentials associated with the target database
   *
   * @param props the construct props
   * @returns the aws secret name with the credentials for running our migrate task
   */
  getSecretId(props: DbMigrateProps): secrets_manager.ISecret {
    let secret: secrets_manager.ISecret | undefined = props.dbCredentialsSecret;
    if (!secret) {
      secret = props.targetDatabaseInstance.secret;
    }

    if (!secret) {
      throw new Error(
        'No database credentials found in either props or on the target database',
      );
    }

    return secret;
  }

  /**
   * The way you retrieve the connection port depends on whether we are dealing
   * with an RDS instance or an Aurora Cluster. Plus the port number won't be
   * resolved until provisioning time (hence the Token.asString code).
   *
   * @param props the construct props
   * @returns the port number to connect to this databases instance/cluster
   */
  getPort(props: DbMigrateProps): string {
    let port: string;
    if (props.targetDatabaseInstance instanceof rds.DatabaseCluster) {
      port = Token.asString(props.targetDatabaseInstance.clusterEndpoint.port);
    } else {
      port = Token.asString(props.targetDatabaseInstance.dbInstanceEndpointPort);
    }

    return port;
  }

  /**
   * Some of the migrate commands allow you to specify a target schema version
   * (i.e 'migrate goto 5'). So we have some special handling here to tack the
   * schema version on to the end of the command where appropriate.
   *
   * @param props the construct props
   * @returns the migrate command to run
   */
  getMigrateCommand(props: DbMigrateProps): string {
    const migrateCommand = props.migrateCommand || DbMigrateCommand.UP;
    let targetSchemaVersion = '';
    if (props.targetSchemaVersion) {
      const n = props.targetSchemaVersion.toString();
      targetSchemaVersion = ` ${n}`;
    }

    switch (migrateCommand) {
      case DbMigrateCommand.UP:
      case DbMigrateCommand.DOWN:
      case DbMigrateCommand.GOTO:
      case DbMigrateCommand.FORCE:
        return `${migrateCommand}${targetSchemaVersion}`;
        break;
      case DbMigrateCommand.DROP:
        return `${migrateCommand} -f`; // don't prompt for confirmation
        break;
      default:
        return migrateCommand;
        break;
    }
  }
}
