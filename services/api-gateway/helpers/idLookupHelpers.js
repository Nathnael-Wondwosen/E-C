const buildIdLookupCandidates = (entityId, ObjectId) => {
  const candidates = [];

  try {
    candidates.push({ _id: new ObjectId(entityId) });
  } catch (error) {
    // Ignore invalid ObjectId candidates.
  }

  candidates.push({ _id: entityId });
  candidates.push({ id: entityId });

  const numericId = Number(entityId);
  if (Number.isInteger(numericId) && `${numericId}` === `${entityId}`.trim()) {
    candidates.push({ id: numericId });
  }

  const seen = new Set();
  return candidates.filter((candidate) => {
    const key = JSON.stringify(candidate);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const findDocumentByFlexibleIdFactory = ({ ObjectId }) =>
  async (collection, entityId) => {
    for (const lookupFilter of buildIdLookupCandidates(entityId, ObjectId)) {
      const document = await collection.findOne(lookupFilter);
      if (document) {
        return { document, lookupFilter };
      }
    }

    return { document: null, lookupFilter: null };
  };

module.exports = {
  findDocumentByFlexibleIdFactory
};
