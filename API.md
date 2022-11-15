# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### DbMigrate <a name="DbMigrate" id="db-migrate-cdk.DbMigrate"></a>

- *Implements:* aws-cdk-lib.aws_ec2.IConnectable, aws-cdk-lib.aws_iam.IGrantable

A high level construct for running  the [migrate]() based migration scripts against an AWS RDS Instance or Aurora cluster.

NOTE: It wouldn't take a lot to extend this to support the other
database targets that 'migrate' supports if required.

#### Initializers <a name="Initializers" id="db-migrate-cdk.DbMigrate.Initializer"></a>

```typescript
import { DbMigrate } from 'db-migrate-cdk'

new DbMigrate(scope: Construct, id: string, props: DbMigrateProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#db-migrate-cdk.DbMigrate.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#db-migrate-cdk.DbMigrate.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#db-migrate-cdk.DbMigrate.Initializer.parameter.props">props</a></code> | <code><a href="#db-migrate-cdk.DbMigrateProps">DbMigrateProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="db-migrate-cdk.DbMigrate.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="db-migrate-cdk.DbMigrate.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="db-migrate-cdk.DbMigrate.Initializer.parameter.props"></a>

- *Type:* <a href="#db-migrate-cdk.DbMigrateProps">DbMigrateProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#db-migrate-cdk.DbMigrate.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#db-migrate-cdk.DbMigrate.addDependency">addDependency</a></code> | *No description.* |
| <code><a href="#db-migrate-cdk.DbMigrate.getMigrateCommand">getMigrateCommand</a></code> | Some of the migrate commands allow you to specify a target schema version (i.e 'migrate goto 5'). So we have some special handling here to tack the schema version on to the end of the command where appropriate. |
| <code><a href="#db-migrate-cdk.DbMigrate.getPort">getPort</a></code> | The way you retrieve the connection port depends on whether we are dealing with an RDS instance or an Aurora Cluster. |
| <code><a href="#db-migrate-cdk.DbMigrate.getSecretId">getSecretId</a></code> | If the user hasn't speficifed their own credentials then default to the credentials associated with the target database. |

---

##### `toString` <a name="toString" id="db-migrate-cdk.DbMigrate.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addDependency` <a name="addDependency" id="db-migrate-cdk.DbMigrate.addDependency"></a>

```typescript
public addDependency(deps: IDependable): void
```

###### `deps`<sup>Required</sup> <a name="deps" id="db-migrate-cdk.DbMigrate.addDependency.parameter.deps"></a>

- *Type:* constructs.IDependable

---

##### `getMigrateCommand` <a name="getMigrateCommand" id="db-migrate-cdk.DbMigrate.getMigrateCommand"></a>

```typescript
public getMigrateCommand(props: DbMigrateProps): string
```

Some of the migrate commands allow you to specify a target schema version (i.e 'migrate goto 5'). So we have some special handling here to tack the schema version on to the end of the command where appropriate.

###### `props`<sup>Required</sup> <a name="props" id="db-migrate-cdk.DbMigrate.getMigrateCommand.parameter.props"></a>

- *Type:* <a href="#db-migrate-cdk.DbMigrateProps">DbMigrateProps</a>

the construct props.

---

##### `getPort` <a name="getPort" id="db-migrate-cdk.DbMigrate.getPort"></a>

```typescript
public getPort(props: DbMigrateProps): string
```

The way you retrieve the connection port depends on whether we are dealing with an RDS instance or an Aurora Cluster.

Plus the port number won't be
resolved until provisioning time (hence the Token.asString code).

###### `props`<sup>Required</sup> <a name="props" id="db-migrate-cdk.DbMigrate.getPort.parameter.props"></a>

- *Type:* <a href="#db-migrate-cdk.DbMigrateProps">DbMigrateProps</a>

the construct props.

---

##### `getSecretId` <a name="getSecretId" id="db-migrate-cdk.DbMigrate.getSecretId"></a>

```typescript
public getSecretId(props: DbMigrateProps): ISecret
```

If the user hasn't speficifed their own credentials then default to the credentials associated with the target database.

###### `props`<sup>Required</sup> <a name="props" id="db-migrate-cdk.DbMigrate.getSecretId.parameter.props"></a>

- *Type:* <a href="#db-migrate-cdk.DbMigrateProps">DbMigrateProps</a>

the construct props.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#db-migrate-cdk.DbMigrate.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="db-migrate-cdk.DbMigrate.isConstruct"></a>

```typescript
import { DbMigrate } from 'db-migrate-cdk'

DbMigrate.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="db-migrate-cdk.DbMigrate.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#db-migrate-cdk.DbMigrate.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#db-migrate-cdk.DbMigrate.property.connections">connections</a></code> | <code>aws-cdk-lib.aws_ec2.Connections</code> | The network connections associated with this resource. |
| <code><a href="#db-migrate-cdk.DbMigrate.property.grantPrincipal">grantPrincipal</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | The principal to grant permissions to. |
| <code><a href="#db-migrate-cdk.DbMigrate.property.response">response</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="db-migrate-cdk.DbMigrate.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `connections`<sup>Required</sup> <a name="connections" id="db-migrate-cdk.DbMigrate.property.connections"></a>

```typescript
public readonly connections: Connections;
```

- *Type:* aws-cdk-lib.aws_ec2.Connections

The network connections associated with this resource.

---

##### `grantPrincipal`<sup>Required</sup> <a name="grantPrincipal" id="db-migrate-cdk.DbMigrate.property.grantPrincipal"></a>

```typescript
public readonly grantPrincipal: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

The principal to grant permissions to.

---

##### `response`<sup>Required</sup> <a name="response" id="db-migrate-cdk.DbMigrate.property.response"></a>

```typescript
public readonly response: string;
```

- *Type:* string

---


## Structs <a name="Structs" id="Structs"></a>

### DbMigrateProps <a name="DbMigrateProps" id="db-migrate-cdk.DbMigrateProps"></a>

#### Initializer <a name="Initializer" id="db-migrate-cdk.DbMigrateProps.Initializer"></a>

```typescript
import { DbMigrateProps } from 'db-migrate-cdk'

const dbMigrateProps: DbMigrateProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#db-migrate-cdk.DbMigrateProps.property.migrationsFolder">migrationsFolder</a></code> | <code>string</code> | The local folder containing the sql migration scripts to be used by the 'migrate' cli command. |
| <code><a href="#db-migrate-cdk.DbMigrateProps.property.targetDatabaseInstance">targetDatabaseInstance</a></code> | <code>aws-cdk-lib.aws_rds.DatabaseCluster \| aws-cdk-lib.aws_rds.DatabaseInstance</code> | The target RDS instance or Aurora cluster to run the migrations against. |
| <code><a href="#db-migrate-cdk.DbMigrateProps.property.targetDatabaseName">targetDatabaseName</a></code> | <code>string</code> | The target database in the target instance/cluster to initially connect to. |
| <code><a href="#db-migrate-cdk.DbMigrateProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | The vpc to define the custom resource lambda function in. |
| <code><a href="#db-migrate-cdk.DbMigrateProps.property.dbCredentialsSecret">dbCredentialsSecret</a></code> | <code>aws-cdk-lib.aws_secretsmanager.ISecret</code> | If you want to use an alternate set of db credentials to access the database to the one associated with the instance then pass it here. |
| <code><a href="#db-migrate-cdk.DbMigrateProps.property.eventHandlerLogRetention">eventHandlerLogRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | *No description.* |
| <code><a href="#db-migrate-cdk.DbMigrateProps.property.eventHandlerMemorySize">eventHandlerMemorySize</a></code> | <code>number</code> | *No description.* |
| <code><a href="#db-migrate-cdk.DbMigrateProps.property.eventHandlerTimeout">eventHandlerTimeout</a></code> | <code>aws-cdk-lib.Duration</code> | *No description.* |
| <code><a href="#db-migrate-cdk.DbMigrateProps.property.migrateCommand">migrateCommand</a></code> | <code><a href="#db-migrate-cdk.DbMigrateCommand">DbMigrateCommand</a></code> | The migrate command that the 'migrate cli' will run. |
| <code><a href="#db-migrate-cdk.DbMigrateProps.property.providerLogRetention">providerLogRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | *No description.* |
| <code><a href="#db-migrate-cdk.DbMigrateProps.property.providerTotalTimeout">providerTotalTimeout</a></code> | <code>aws-cdk-lib.Duration</code> | *No description.* |
| <code><a href="#db-migrate-cdk.DbMigrateProps.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | Security groups to attach to the lambda function. |
| <code><a href="#db-migrate-cdk.DbMigrateProps.property.subnetSelection">subnetSelection</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | Which subnets from the VPC to place the lambda functions in. |
| <code><a href="#db-migrate-cdk.DbMigrateProps.property.targetSchemaVersion">targetSchemaVersion</a></code> | <code>number</code> | Some migrate commands accept an optional second argument for the target schema version to move to. |

---

##### `migrationsFolder`<sup>Required</sup> <a name="migrationsFolder" id="db-migrate-cdk.DbMigrateProps.property.migrationsFolder"></a>

```typescript
public readonly migrationsFolder: string;
```

- *Type:* string

The local folder containing the sql migration scripts to be used by the 'migrate' cli command.

These scripts will first be uploaded to
S3 where they will be access by the lambda function running the migrate
cli.

---

##### `targetDatabaseInstance`<sup>Required</sup> <a name="targetDatabaseInstance" id="db-migrate-cdk.DbMigrateProps.property.targetDatabaseInstance"></a>

```typescript
public readonly targetDatabaseInstance: DatabaseCluster | DatabaseInstance;
```

- *Type:* aws-cdk-lib.aws_rds.DatabaseCluster | aws-cdk-lib.aws_rds.DatabaseInstance

The target RDS instance or Aurora cluster to run the migrations against.

---

##### `targetDatabaseName`<sup>Required</sup> <a name="targetDatabaseName" id="db-migrate-cdk.DbMigrateProps.property.targetDatabaseName"></a>

```typescript
public readonly targetDatabaseName: string;
```

- *Type:* string

The target database in the target instance/cluster to initially connect to.

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="db-migrate-cdk.DbMigrateProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

The vpc to define the custom resource lambda function in.

---

##### `dbCredentialsSecret`<sup>Optional</sup> <a name="dbCredentialsSecret" id="db-migrate-cdk.DbMigrateProps.property.dbCredentialsSecret"></a>

```typescript
public readonly dbCredentialsSecret: ISecret;
```

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret
- *Default:* targetDatabase.secret

If you want to use an alternate set of db credentials to access the database to the one associated with the instance then pass it here.

---

##### `eventHandlerLogRetention`<sup>Optional</sup> <a name="eventHandlerLogRetention" id="db-migrate-cdk.DbMigrateProps.property.eventHandlerLogRetention"></a>

```typescript
public readonly eventHandlerLogRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* Retention.ONE_YEAR

---

##### `eventHandlerMemorySize`<sup>Optional</sup> <a name="eventHandlerMemorySize" id="db-migrate-cdk.DbMigrateProps.property.eventHandlerMemorySize"></a>

```typescript
public readonly eventHandlerMemorySize: number;
```

- *Type:* number
- *Default:* 128

---

##### `eventHandlerTimeout`<sup>Optional</sup> <a name="eventHandlerTimeout" id="db-migrate-cdk.DbMigrateProps.property.eventHandlerTimeout"></a>

```typescript
public readonly eventHandlerTimeout: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.minutes(14)

---

##### `migrateCommand`<sup>Optional</sup> <a name="migrateCommand" id="db-migrate-cdk.DbMigrateProps.property.migrateCommand"></a>

```typescript
public readonly migrateCommand: DbMigrateCommand;
```

- *Type:* <a href="#db-migrate-cdk.DbMigrateCommand">DbMigrateCommand</a>
- *Default:* DbMigrateCommand.UP

The migrate command that the 'migrate cli' will run.

---

##### `providerLogRetention`<sup>Optional</sup> <a name="providerLogRetention" id="db-migrate-cdk.DbMigrateProps.property.providerLogRetention"></a>

```typescript
public readonly providerLogRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* Retention.ONE_YEAR

---

##### `providerTotalTimeout`<sup>Optional</sup> <a name="providerTotalTimeout" id="db-migrate-cdk.DbMigrateProps.property.providerTotalTimeout"></a>

```typescript
public readonly providerTotalTimeout: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.minutes(14)

---

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="db-migrate-cdk.DbMigrateProps.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]
- *Default:* a dedicated security group is created for each function.

Security groups to attach to the lambda function.

---

##### `subnetSelection`<sup>Optional</sup> <a name="subnetSelection" id="db-migrate-cdk.DbMigrateProps.property.subnetSelection"></a>

```typescript
public readonly subnetSelection: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection
- *Default:* the Vpc default strategy if not specified

Which subnets from the VPC to place the lambda functions in.

Note: internet access for Lambdas
requires a NAT gateway, so picking Public subnets is not allowed.

---

##### `targetSchemaVersion`<sup>Optional</sup> <a name="targetSchemaVersion" id="db-migrate-cdk.DbMigrateProps.property.targetSchemaVersion"></a>

```typescript
public readonly targetSchemaVersion: number;
```

- *Type:* number

Some migrate commands accept an optional second argument for the target schema version to move to.

---



## Enums <a name="Enums" id="Enums"></a>

### DbMigrateCommand <a name="DbMigrateCommand" id="db-migrate-cdk.DbMigrateCommand"></a>

Defines the possible commands you can pass to the 'migrate' cli.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#db-migrate-cdk.DbMigrateCommand.UP">UP</a></code> | Will instruct migrate to move the schema evolutions forward as far as possible or to the specified version. |
| <code><a href="#db-migrate-cdk.DbMigrateCommand.DOWN">DOWN</a></code> | Will instruct migrate to move the schema evolutions back as far as possible or to the specified version. |
| <code><a href="#db-migrate-cdk.DbMigrateCommand.GOTO">GOTO</a></code> | Will instruct migrate to move the schema evolutions to the specified version. |
| <code><a href="#db-migrate-cdk.DbMigrateCommand.DROP">DROP</a></code> | Drop everything in the database. |
| <code><a href="#db-migrate-cdk.DbMigrateCommand.FORCE">FORCE</a></code> | Set version to specified version but don't run migration. |
| <code><a href="#db-migrate-cdk.DbMigrateCommand.VERSION">VERSION</a></code> | Prints the currently applied schema version. |

---

##### `UP` <a name="UP" id="db-migrate-cdk.DbMigrateCommand.UP"></a>

Will instruct migrate to move the schema evolutions forward as far as possible or to the specified version.

---


##### `DOWN` <a name="DOWN" id="db-migrate-cdk.DbMigrateCommand.DOWN"></a>

Will instruct migrate to move the schema evolutions back as far as possible or to the specified version.

---


##### `GOTO` <a name="GOTO" id="db-migrate-cdk.DbMigrateCommand.GOTO"></a>

Will instruct migrate to move the schema evolutions to the specified version.

---


##### `DROP` <a name="DROP" id="db-migrate-cdk.DbMigrateCommand.DROP"></a>

Drop everything in the database.

---


##### `FORCE` <a name="FORCE" id="db-migrate-cdk.DbMigrateCommand.FORCE"></a>

Set version to specified version but don't run migration.

---


##### `VERSION` <a name="VERSION" id="db-migrate-cdk.DbMigrateCommand.VERSION"></a>

Prints the currently applied schema version.

---

