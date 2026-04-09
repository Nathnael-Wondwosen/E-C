// services/api-gateway/repositories/Repository.js
// Base repository class for common database operations

const { ObjectId } = require('mongodb');

class Repository {
  constructor(db, collectionName) {
    this.db = db;
    this.collectionName = collectionName;
    this.collection = db.collection(collectionName);
  }

  /**
   * Find by ID with flexible ID formats
   */
  async findById(id) {
    try {
      const objectId = ObjectId.isValid(id) ? new ObjectId(id) : id;
      return await this.collection.findOne({ 
        $or: [{ _id: objectId }, { id: id }] 
      });
    } catch {
      return null;
    }
  }

  toObjectId(id) {
    return ObjectId.isValid(id) ? new ObjectId(id) : id;
  }

  async findByIds(ids = []) {
    const normalizedIds = [...new Set((ids || []).map((id) => String(id || '')).filter(Boolean))];
    if (!normalizedIds.length) {
      return [];
    }

    const objectIds = normalizedIds
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    return this.collection.find({
      $or: [
        { _id: { $in: objectIds } },
        { id: { $in: normalizedIds } }
      ]
    }).toArray();
  }

  /**
   * Find one by any field
   */
  async findOne(query, projection = null) {
    const options = projection ? { projection } : {};
    return await this.collection.findOne(query, options);
  }

  /**
   * Find multiple with pagination
   */
  async find(query = {}, { page = 1, limit = 20, projection = null, sort = null } = {}) {
    const skip = (page - 1) * limit;
    const options = {};
    
    if (projection) options.projection = projection;
    if (sort) options.sort = sort;

    const [documents, total] = await Promise.all([
      this.collection
        .find(query, options)
        .skip(skip)
        .limit(Math.min(limit, 100))
        .toArray(),
      this.collection.countDocuments(query)
    ]);

    return {
      documents,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  }

  async findAll({ page = 1, limit = 50, projection = null, sort = { createdAt: -1 } } = {}) {
    const result = await this.find({}, { page, limit, projection, sort });
    return result.documents;
  }

  /**
   * Create document
   */
  async create(data) {
    const document = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(document);
    return { ...document, _id: result.insertedId };
  }

  /**
   * Update by ID
   */
  async updateById(id, data) {
    const objectId = this.toObjectId(id);
    const result = await this.collection.findOneAndUpdate(
      { $or: [{ _id: objectId }, { id }] },
      {
        $set: {
          ...data,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  /**
   * Delete by ID
   */
  async deleteById(id) {
    const objectId = this.toObjectId(id);
    const result = await this.collection.deleteOne({ $or: [{ _id: objectId }, { id }] });
    return result.deletedCount > 0;
  }

  /**
   * Count documents
   */
  async count(query = {}) {
    return await this.collection.countDocuments(query);
  }

  /**
   * Bulk operation
   */
  async insertMany(documents) {
    const docsWithTimestamps = documents.map((doc) => ({
      ...doc,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    const result = await this.collection.insertMany(docsWithTimestamps);
    return result.insertedIds;
  }
}

module.exports = Repository;
