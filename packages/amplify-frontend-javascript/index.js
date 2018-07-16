const initializer = require('./lib/initializer');
const projectScanner = require('./lib/project-scanner');
const configManager = require('./lib/configuration-manager');
const server = require('./lib/server');
const publisher = require('./lib/publisher');
const constants = require('./lib/constants');
const { createAWSExports, createAmplifyConfig } = require('./lib/frontend-config-creator');

function scanProject(projectPath) {
  return projectScanner.run(projectPath);
}

function init(context) {
  return initializer.run(context);
}

function onInitSuccessful(context) {
  return initializer.onInitSuccessful(context);
}

function createFrontendConfigs(context, amplifyResources) {
  const { outputsByProvider, outputsByCategory } = amplifyResources;
  createAmplifyConfig(context, outputsByCategory);
  createAWSExports(context, outputsByProvider['amplify-provider-awscloudformation']);
}

function configure(context) {
  return configManager.configure(context);
}

function publish(context) {
  return publisher.run(context);
}

function run(context) {
  return server.run(context);
}

module.exports = {
  constants,
  scanProject,
  init,
  onInitSuccessful,
  configure,
  publish,
  run,
  createFrontendConfigs,
};
