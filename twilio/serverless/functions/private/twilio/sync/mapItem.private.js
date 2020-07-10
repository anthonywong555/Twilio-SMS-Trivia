
const fetch = async (twilioClient, SYNC_SERVICE_SID, mapName, mapItemName) => {
  try {
    const result = await twilioClient.sync
      .services(SYNC_SERVICE_SID)
      .syncMaps(mapName)
      .syncMapItems(mapItemName)
      .fetch();

    return result;
  } catch(e) {
    throw e;
  }
}

const insert = async (twilioClient, SYNC_SERVICE_SID, mapName, key, data) => {
  try {
    const result = await twilioClient.sync
      .services(SYNC_SERVICE_SID)
      .syncMaps(mapName)
      .syncMapItems
      .create({key, data});
    return result;
  } catch (e) {
    throw e;
  }
}

module.exports = {fetch, insert};