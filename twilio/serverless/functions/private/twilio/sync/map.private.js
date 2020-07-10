const fetch = async (twilioClient, SYNC_SERVICE_SID, uniqueName) => {
  try {
    const result = await twilioClient.sync
      .services(SYNC_SERVICE_SID)
      .syncMaps(uniqueName)
      .fetch();

    return result;
  } catch(e) {
    throw e;
  }
}

module.exports = {fetch};