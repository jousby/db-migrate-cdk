# DB Migrate CDK
[![Docs](https://img.shields.io/badge/Construct%20Hub-db--migrate--cdk-orange)](https://constructs.dev/packages/db-migrate-cdk)
[![release](https://github.com/jousby/db-migrate-cdk/actions/workflows/release.yml/badge.svg)](https://github.com/jousby/db-migrate-cdk/actions/workflows/release.yml)
![npm](https://img.shields.io/npm/dt/db-migrate-cdk?label=npm&color=blueviolet)

Apply schema evolutions/database migrations using the golang [migrate](https://github.com/golang-migrate/migrate)
cli tool in your CDK stack. The key pattern this enables is the ability to 
initialise (and update) the schema after the database is provisioned but before 
your application is deployed and tries to connect. 

**NOTE**: migrate supports a number of [database types](https://github.com/golang-migrate/migrate#databases) 
but currently this construct only supports Amazon RDS Instances (mysql or postgres) and Amazon RDS Aurora 
Clusters (mysql or postgres).

## Cool things you can do with this construct

As part of the CDK stack that provisions your database:
* Create an initial database schema
* Continually update the database schema on each 'cdk deploy'
* Create new database users, roles and manage permissions
* Populate tables with static/ref data
* Populate tables with test data
* Clean and repopulate table data to a known state on each 'cdk deploy'
* Drop the entire schema and recreate on each 'cdk deploy'

## Important Context

To have success with this construct you need to understand how db schema evolution/migration tools like [migrate](https://github.com/golang-migrate/migrate), [flyway](https://flywaydb.org/) and [liquidbase](https://www.liquibase.org/) work. In short they apply an ordered sequence of sql scripts (migrations/evolutions)
to a target database. The tool maintains a table in the target database to keep track of what 
the highest applied script is. Each time it runs it checks to see if there a 'higher' ordered
script it can apply and updates its watermark accordingly. 

For more details checkout:

* Flyway - [Why database migrations](https://flywaydb.org/documentation/getstarted/why)
* migrate - [Getting Started]()

## Usage

### Step 1

Create your ordered sequence of migration scripts in a folder in your project - [see migrations guide](https://github.com/golang-migrate/migrate/blob/master/MIGRATIONS.md). eg in \<project_base\>/migrations' you might create the file '1_initialize_schema.up.sql' that contains:

```sql
CREATE TABLE CUSTOMERS(
   ID       INT              NOT NULL,
   NAME     VARCHAR (20)     NOT NULL,
   AGE      INT              NOT NULL,
   ADDRESS  CHAR (25) ,
   PRIMARY KEY (ID)
);
```

### Step 2

In your CDK Stack you create a 'DBMigrate' construct that looks to run
the migration scripts created in step 1 against an RDS/Aurora database that
has been provisioned earlier in the CDK Stack. 

```typescript
  // Run our 'migrate' based schema setup on our mysql instance
  const mysqlRdsMigration = new DbMigrate(this, 'MysqlRdsMigrateTask', {
    vpc,
    targetDatabaseInstance: mysqlRdsInstance,
    targetDatabaseName: dbName,
    migrationsFolder: './migrations',
  })
```
<br/>
<details>
  <summary>A more complete example</summary>

```typescript
import {
  Stack,
  StackProps,
  CfnOutput,
  Token,
  aws_rds as rds,
  aws_ec2 as ec2,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { DbMigrate, DbMigrateCommand } from 'db-migrate-cdk'

/**
 * Provision a test database and executes some test migrations using
 * the DbMigrate construct.
 */
export class DbMigrateTestStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    const vpc = new ec2.Vpc(this, 'MigrateVPC')

    // Initial database to create in our database instance
    const dbName = 'init'

    // Mysql RDS instance
    const mysqlRdsInstance = new rds.DatabaseInstance(this, 'MysqlRdsMigrateInstance', {
      vpc,
      allocatedStorage: 20,
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0,
      }),
      databaseName: dbName,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MEDIUM),
    })

    // Run our 'migrate' based schema setup on our mysql instance
    const mysqlRdsMigration = new DbMigrate(this, 'MysqlRdsMigrateTask', {
      vpc,
      targetDatabaseInstance: mysqlRdsInstance,
      targetDatabaseName: dbName,
      migrationsFolder: `./migrations/${dbName}`,
      migrateCommand: DbMigrateCommand.UP,
    })

    new CfnOutput(this, 'MysqlRdsMigrateTaskResponse', {
      value: Token.asString(mysqlRdsMigration.response),
    })
  }
}
```

</details>
<br/>


## Limitations / Other Options

This construct is running 'migrate' via an AWS Lambda function as part of an AWS Custom Resource in AWS Cloudformation. Specifically the lambda function is packaged up as a Docker container that has the 'migrate' cli bundled into the image. 
This means that your specified migrate command needs to run within the constraits of the Lambda runtime. In particular 
(as of 11/2022) the command needs to complete within the 15 min runtime limit of AWS Lambda and operate within the compute/memory cap of the lambda runtime. 

These constraints should be fine for a large number of usecases. However if not then you might want to consider:

* Running 'migrate' as a stage in a ci/cd pipeline on a container/vm backed build agent
* Running 'migrate' as part of the boot sequence in your application on the compute that drives your application
* Running 'migrate' manually against the target database to do exceptional case scenarios (i.e complex DML changes on large volumes of data that might take over 15 mins to run)
* Some hybrid model of the options above

## Credits

The following blog posts were helpful in pulling this construct together:

* [DB Schema change management with the CDK Custom Resources - Florian Chazel](https://medium.com/i-love-my-local-farmer-engineering-blog/db-schema-change-management-with-the-cdk-custom-resources-f107625de0ab)

* [Use aws cdk to initialize amazon rds instances -  Rolando Santamaria Maso, Ramy Nasreldin, Prasanna Tuladhar](https://aws.amazon.com/blogs/infrastructure-and-automation/use-aws-cdk-to-initialize-amazon-rds-instances/)

* [AWS lambda database migrations - David Koblas](https://www.skitoy.com/p/aws-lambda-database-migrations/644/)

## License

This project is licensed under the Apache-2.0 License.