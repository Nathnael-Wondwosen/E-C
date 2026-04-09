const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const { loadGatewayEnv } = require('../config/env');
const { ensureGatewayIndexes } = require('../config/indexes');

const toTrimmedString = (value) => String(value || '').trim();

const toDateValue = (value, fallback = null) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return fallback;
  return date;
};

const toTimestamp = (value) => {
  const date = toDateValue(value);
  return date ? date.getTime() : 0;
};

const buildThreadKey = (row) => {
  const productId = toTrimmedString(row?.productId);
  const buyerId = toTrimmedString(row?.buyerId || row?.fromUserId);
  const sellerId = toTrimmedString(row?.sellerId || row?.toUserId);
  if (!productId || !buyerId || !sellerId) return '';
  return `thread:${productId}:${buyerId}:${sellerId}`;
};

const normalizeMessageKey = (message = {}) => {
  const id = toTrimmedString(message.id);
  if (id) return `id:${id}`;
  return [
    toTrimmedString(message.senderId),
    toTrimmedString(message.createdAt),
    toTrimmedString(message.text),
  ].join('|');
};

const compareByUpdatedDesc = (a, b) => {
  const aUpdated = toTimestamp(a?.updatedAt || a?.createdAt);
  const bUpdated = toTimestamp(b?.updatedAt || b?.createdAt);
  return bUpdated - aUpdated;
};

const mergeMessages = (rows) => {
  const all = rows
    .flatMap((row) => (Array.isArray(row?.messages) ? row.messages : []))
    .filter((item) => toTrimmedString(item?.text));

  const seen = new Set();
  const unique = [];
  for (const item of all) {
    const key = normalizeMessageKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push({
      id: toTrimmedString(item.id) || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      senderId: toTrimmedString(item.senderId),
      senderRole: toTrimmedString(item.senderRole),
      text: toTrimmedString(item.text),
      createdAt: toDateValue(item.createdAt, new Date()),
    });
  }

  return unique.sort((a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt));
};

const mergeLastRead = (rows) => {
  const merged = {};
  for (const row of rows) {
    const source = row?.lastReadAtByUser && typeof row.lastReadAtByUser === 'object'
      ? row.lastReadAtByUser
      : {};

    for (const [userId, readAtRaw] of Object.entries(source)) {
      const userKey = toTrimmedString(userId);
      if (!userKey) continue;
      const readAt = toDateValue(readAtRaw);
      if (!readAt) continue;
      const current = merged[userKey];
      if (!current || readAt.getTime() > current.getTime()) {
        merged[userKey] = readAt;
      }
    }
  }

  return merged;
};

const run = async () => {
  const env = loadGatewayEnv();
  const client = await MongoClient.connect(env.mongoUri);
  const db = client.db(env.dbName);
  const runId = `dedupe-${new Date().toISOString()}`;
  const collection = db.collection('product_inquiries');
  const backupCollection = db.collection('product_inquiries_dedup_backup');

  const rows = await collection.find({}).toArray();
  const grouped = new Map();
  const missingKeyIds = [];

  for (const row of rows) {
    const threadKey = buildThreadKey(row);
    if (!threadKey) {
      missingKeyIds.push(row?._id);
      continue;
    }
    if (!grouped.has(threadKey)) grouped.set(threadKey, []);
    grouped.get(threadKey).push(row);
  }

  let groupsWithDuplicates = 0;
  let mergedIntoPrimary = 0;
  let removedDuplicates = 0;
  let assignedThreadKeyOnly = 0;
  let backupCount = 0;

  for (const [threadKey, groupRows] of grouped.entries()) {
    if (groupRows.length === 1) {
      const only = groupRows[0];
      if (!toTrimmedString(only?.threadKey)) {
        await collection.updateOne(
          { _id: only._id },
          { $set: { threadKey } }
        );
        assignedThreadKeyOnly += 1;
      }
      continue;
    }

    groupsWithDuplicates += 1;
    const sorted = [...groupRows].sort(compareByUpdatedDesc);
    const primary = sorted[0];
    const duplicates = sorted.slice(1);

    const mergedMessages = mergeMessages(sorted);
    const mergedLastReadAtByUser = mergeLastRead(sorted);

    const latest = sorted[0];
    const earliestCreated = [...sorted]
      .map((item) => toDateValue(item?.createdAt))
      .filter(Boolean)
      .sort((a, b) => a.getTime() - b.getTime())[0] || new Date();
    const latestUpdated = [...sorted]
      .map((item) => toDateValue(item?.updatedAt || item?.createdAt))
      .filter(Boolean)
      .sort((a, b) => b.getTime() - a.getTime())[0] || new Date();

    const latestMessageText = mergedMessages.length
      ? toTrimmedString(mergedMessages[mergedMessages.length - 1]?.text)
      : toTrimmedString(latest?.message);

    await collection.updateOne(
      { _id: primary._id },
      {
        $set: {
          productId: toTrimmedString(primary.productId || latest.productId),
          buyerId: toTrimmedString(primary.buyerId || primary.fromUserId || latest.buyerId || latest.fromUserId),
          fromUserId: toTrimmedString(primary.fromUserId || primary.buyerId || latest.fromUserId || latest.buyerId),
          sellerId: toTrimmedString(primary.sellerId || primary.toUserId || latest.sellerId || latest.toUserId),
          toUserId: toTrimmedString(primary.toUserId || primary.sellerId || latest.toUserId || latest.sellerId),
          productName: toTrimmedString(primary.productName || latest.productName),
          subject: toTrimmedString(primary.subject || latest.subject),
          quantity: Number(primary.quantity || latest.quantity || 1),
          status: toTrimmedString(primary.status || latest.status || 'new') || 'new',
          messages: mergedMessages,
          message: latestMessageText || toTrimmedString(primary.message || latest.message),
          lastReadAtByUser: mergedLastReadAtByUser,
          threadKey,
          createdAt: earliestCreated,
          updatedAt: latestUpdated,
          dedupeUpdatedAt: new Date(),
          dedupeRunId: runId,
        }
      }
    );

    mergedIntoPrimary += 1;

    if (duplicates.length) {
      const backupDocs = duplicates.map((row) => {
        const { _id, ...rest } = row;
        return {
          ...rest,
          _backupId: _id,
          _backupRunId: runId,
          _backupPrimaryId: primary._id,
          _backupAt: new Date(),
        };
      });
      if (backupDocs.length) {
        await backupCollection.insertMany(backupDocs, { ordered: false });
        backupCount += backupDocs.length;
      }

      const duplicateIds = duplicates
        .map((row) => row?._id)
        .filter((id) => id instanceof ObjectId);
      if (duplicateIds.length) {
        const deleteResult = await collection.deleteMany({ _id: { $in: duplicateIds } });
        removedDuplicates += Number(deleteResult?.deletedCount || 0);
      }
    }
  }

  await ensureGatewayIndexes(db);

  console.log(JSON.stringify({
    success: true,
    runId,
    totalRows: rows.length,
    groupsScanned: grouped.size,
    groupsWithDuplicates,
    mergedIntoPrimary,
    removedDuplicates,
    backupCount,
    assignedThreadKeyOnly,
    rowsMissingThreadParts: missingKeyIds.length,
    database: env.dbName,
  }, null, 2));

  await client.close();
};

run().catch((error) => {
  console.error(JSON.stringify({
    success: false,
    message: error?.message || 'Unknown error',
    stack: error?.stack || '',
  }, null, 2));
  process.exit(1);
});
