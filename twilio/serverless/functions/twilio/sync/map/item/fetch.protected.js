let serverlessHelper = null;
let twilioHelper = null;

exports.handler = async (context, event, callback) => {
  try {
    const twilioClient = require('twilio')(context.ACCOUNT_SID, context.AUTH_TOKEN);
    await loadServerlessModules();

    const result = await driver(context, event, twilioClient);
    return callback(null, result);

  } catch (e) {
    return callback(e);
  }
};

const loadServerlessModules = async () => {
  try {
    const functions = Runtime.getFunctions();

    const serverlessHelperPath = functions['private/boilerplate/helper'].path;
    serverlessHelper = require(serverlessHelperPath);

    const twilioHelperPath = functions['private/twilio/index'].path;
    twilioHelper = require(twilioHelperPath);
  } catch (e) {
    throw e;
  }
}

const driver = async (serverlessContext, serverlessEvent, twilioClient) => {
  try {
    const {syncServiceSID, mapName, mapItemName} = serverlessEvent;
    
    const result = await twilioHelper
      .syncMapItem
      .fetch(twilioClient, syncServiceSID, mapName, mapItemName);
    return result;
  } catch (e) {
    throw serverlessHelper.formatErrorMsg(serverlessContext, 'driver', e);
  }
}