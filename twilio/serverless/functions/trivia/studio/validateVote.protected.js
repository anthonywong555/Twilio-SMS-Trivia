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
    const result = isVoteValid(serverlessContext, serverlessEvent, twilioClient);

    return result;
  } catch (e) {
    throw serverlessHelper.formatErrorMsg(serverlessContext, 'driver', e);
  }
}

const isVoteValid = async (serverlessContext, serverlessEvent, twilioClient) => {
  try {
    const {vote, question, userId} = serverlessEvent;
    let result = false;
    switch(vote) {
      case "1":
      case "2":
      case "3": 
      case "4":
        const duplicateVote = await getDuplicateVote(serverlessContext, twilioClient, question, userId);
        
        result = duplicateVote ? 
          `Sorry, you can't change your vote. You voted for ${duplicateVote.vote}` : 
          true;
        break;
      default:
        result = `Your vote: '${vote}' was not accpeted. Please submit a validate vote.`;
        break;
    }
  
    return {result};
  } catch (e) {
    throw serverlessHelper.formatErrorMsg(serverlessContext, 'isVoteValid', e);
  }
}

const getDuplicateVote = async (serverlessContext, twilioClient, questionUniqueName, userId) => {
  try {
    const voteList = await twilioHelper
      .syncListItem
      .fetch(twilioClient, serverlessContext.TWILIO_SYNC_SERVICE_SID, questionUniqueName);
    
    const voteItem = voteList.find(
      anItem => {return anItem.userId === userId}
    );
  
    return voteItem;
  } catch (e) {
    throw serverlessHelper.formatErrorMsg(serverlessContext, 'isVoteDuplicate', e);
  }
}