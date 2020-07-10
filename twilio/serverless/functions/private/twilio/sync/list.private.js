const fetch = async (twilioClient, SYNC_SERVICE_SID, listUniqueName) => {
  try {
    const result = await twilioClient.sync
      .services(SYNC_SERVICE_SID)
      .syncLists(listUniqueName)
      .fetch();

    return result;
  } catch(e) {
    throw e;
  }
};

module.exports = {fetch};