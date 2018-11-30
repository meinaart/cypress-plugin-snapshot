/* globals Cypress, before, after, cy */
/* eslint-env browser */
const { merge } = require('lodash');
const { MATCH_IMAGE } = require('../tasks/taskNames');
const getTaskData = require('../utils/commands/getTaskData');
const logMessage = require('../utils/commands/logMessage');
const { NO_LOG } = require('../constants');
const { COMMAND_MATCH_IMAGE_SNAPSHOT: commandName } = require('./commandNames');
const { getImageData } = require('../utils/imageSnapshots');
const { getConfig, DEFAULT_IMAGE_CONFIG } = require('../config');

const SCREENSHOT_CONFIG = {
  blackout: ['.snapshot-diff'],
  capture: 'fullPage',
  log: false,
}

function afterScreenshot(taskData) {
  return ($el, props) => {
    // See this url for contents of `props`:
    // https://docs.cypress.io/api/commands/screenshot.html#Get-screenshot-info-from-the-onAfterScreenshot-callback
    taskData.image = getImageData(props, window.devicePixelRatio);
    taskData.isImage = true;
    delete taskData.subject;
  };
}

function toMatchImageSnapshot(subject, commandOptions) {
  const config = getConfig();
  const options = merge({}, DEFAULT_IMAGE_CONFIG, config.imageOptions, commandOptions);

  const taskData = getTaskData({
    commandName,
    options,
    subject,
  });

  const screenShotConfig = merge({}, SCREENSHOT_CONFIG, {
    onAfterScreenshot: afterScreenshot(taskData)
  });

  return cy.wrap(subject, NO_LOG)
    .screenshot(taskData.snapshotTitle, screenShotConfig)
    .then(() => cy.task(
        MATCH_IMAGE,
        taskData,
        NO_LOG
      ).then(logMessage)
    );
}

module.exports = toMatchImageSnapshot;
