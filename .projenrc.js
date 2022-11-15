const { awscdk } = require('projen');
const cdkVersion = '2.50.0';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'James Ousby',
  cdkVersion: cdkVersion,
  defaultReleaseBranch: 'main',
  name: 'db-migrate-cdk',
  repositoryUrl: 'https://github.com/jousby/db-migrate-cdk.git',
  // deps: [
  // ],
  bundledDeps: [
    '@aws-sdk/client-secrets-manager@^3.192.0',
    '@types/aws-lambda@^8.10.108',
  ],
  // devDeps: [
  // ],

  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();