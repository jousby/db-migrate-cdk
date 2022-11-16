const { awscdk } = require('projen');
const cdkVersion = '2.50.0';

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'James Ousby',
  cdkVersion: cdkVersion,
  defaultReleaseBranch: 'main',
  name: 'db-migrate-cdk',
  repositoryUrl: 'https://github.com/jousby/db-migrate-cdk.git',
  description: 'L3 CDK construct to run golang migrate database migrations',
  keywords: ['cdk', 'migrate', 'rds', 'aurora', 'mysql', 'postgres', 'migrations', 'schema', 'evolutions', 'database'],
  bundledDeps: [
    '@aws-sdk/client-secrets-manager@^3.192.0',
    '@types/aws-lambda@^8.10.108',
  ],
});

// This funky post compile step is to ensure the packaged function
// includes the Dockerfile and package.json used to deploy the lambda
// function as a container image
project.postCompileTask.exec('rm -rf ./lib/db-migrate-function');
project.postCompileTask.exec('cp -r ./src/db-migrate-function ./lib');
project.postCompileTask.exec('rm -rf ./lib/db-migrate-function/node_modules');

project.synth();