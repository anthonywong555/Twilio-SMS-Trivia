const functions = Runtime.getFunctions();
const syncMapPath = functions['private/twilio/sync/map'].path;
const syncMapItemPath = functions['private/twilio/sync/mapItem'].path;
const syncDocumentPath = functions['private/twilio/sync/document'].path;
const syncListPath = functions['private/twilio/sync/list'].path;
const syncListItemPath = functions['private/twilio/sync/list/item'].path;;
const syncMap = require(syncMapPath);
const syncMapItem = require(syncMapItemPath);
const syncDocument = require(syncDocumentPath);
const syncList = require(syncListPath);
const syncListItem = require(syncListItemPath);

module.exports = {syncMap, syncMapItem, syncDocument, syncList, syncListItem};