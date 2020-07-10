const onlyEmoji = require('emoji-aware').onlyEmoji;

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
    const memory = JSON.parse(serverlessEvent.Memory);

    const {playerPhoneNumber} = memory;
    const {firstNameRequest, lastNameRequest, emojiStatusRequest} = memory.twilio.collected_data.playerInformation.answers;
    const firstName = firstNameRequest.answer;
    const lastName = lastNameRequest.answer;
    const emojiStatus = emojiStatusRequest.answer;
    
    // Returns only the emoji contained in the string.
    const emojiArray = onlyEmoji(emojiStatus);
    
    let response = null;
    
    if(emojiArray.length > 0) {
      const playerData = generatePlayer(firstName, lastName, playerPhoneNumber, emojiStatus);
      console.log('playerData', playerData);
      const result = await twilioHelper
      .syncMapItem
      .insert(twilioClient, serverlessContext.TWILIO_SYNC_SERVICE_SID, serverlessContext.TRIVIA_SYNC_MAP_PLAYERS, playerPhoneNumber, playerData);
      console.log('result', result);
      response = {
            "actions": [
                {
                    "say": `Thank you for your submission. You can start voting now!`
                },
                {
                    "listen": false
                }
            ]
        };
    } else {
        response = {
            "actions": [
              {
                "collect": {
                  "name": "playerInformation",
                  "questions": [
                    {
                      "question": `Sorry but, "${emojiStatus}" is not an emoji. \n\nPlease tell me how you feel right now using emoji. (Please only send one)`,
                      "name": "emojiStatusRequest"
                    }
                  ],
                  "on_complete": {
                    "redirect": {
                      "method": "POST",
                      "uri": `https://${serverlessContext.DOMAIN_NAME}/${serverlessContext.PATH}`
                    }
                  }
                }
              }
            ]
          }
    }
    
    return response;
  } catch (e) {
    throw serverlessHelper.formatErrorMsg(serverlessContext, 'driver', e);
  }
}

const generatePlayer = (firstName, lastName, phoneNumber, emojiStatus) => {
  const result = {
    firstName,
    lastName,
    phoneNumber,
    emojiStatus,
    fullName: `${firstName} ${lastName}`,
  };

  return result;
}