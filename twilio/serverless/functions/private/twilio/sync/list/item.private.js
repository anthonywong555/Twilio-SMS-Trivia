const insert = async (twilioClient, SYNC_SERVICE_SID, listUniqueName, data) => {
  try {
    const result = await twilioClient.sync
      .services(SYNC_SERVICE_SID)
      .syncLists(listUniqueName)
      .syncListItems
      .create({data});

    return result;
  } catch(e) {
    throw e;
  }
};

const fetch = async (twilioClient, SYNC_SERVICE_SID, listUniqueName, format=true) => {
  try {
    const list = await twilioClient.sync
      .services(SYNC_SERVICE_SID)
      .syncLists(listUniqueName)
      .syncListItems
      .list({limit: 20});
    
    let result = list;

    if(format) {
      result = [];

      for(const aListItem of list) {
        const {data} = aListItem;
        result.push(data);
      }
    }

    return result;
  } catch(e) {
    throw e;
  }
};

module.exports = {insert, fetch};