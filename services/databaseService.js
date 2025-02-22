import ApiError from '../utils/ApiError';

export default class DatabaseService {
  constructor(model) {
    this.model = model;
  }

  // Basic CRUD operations
  async create(data) {
    return this.model.create(data);
  }

  async findOne(filter, options = {}) {
    const { select, populate } = options;
    let query = this.model.findOne(filter);
    
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    
    return query;
  }

  async findById(id, options = {}) {
    const { select, populate } = options;
    let query = this.model.findById(id);
    
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    
    return query;
  }

  async update(filter, data, options = {}) {
    const defaults = { new: true, runValidators: true };
    const opts = { ...defaults, ...options };
    return this.model.findOneAndUpdate(filter, data, opts);
  }

  async delete(filter) {
    return this.model.findOneAndDelete(filter);
  }

  // Advanced queries
  async find(filter, options = {}) {
    const { 
      select, 
      populate, 
      sort = { createdAt: -1 }, 
      page = 1, 
      limit = 10 
    } = options;

    let query = this.model.find(filter);
    
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (sort) query = query.sort(sort);
    
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    
    return query;
  }

  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }

  // Utility methods
  async exists(filter) {
    return this.model.exists(filter);
  }

  async count(filter) {
    return this.model.countDocuments(filter);
  }

  // Bulk operations
  async bulkWrite(operations) {
    return this.model.bulkWrite(operations);
  }

  async findOneOrFail(filter, options = {}) {
    const doc = await this.findOne(filter, options);
    if (!doc) {
      throw new ApiError(404, `${this.model.modelName} not found`);
    }
    return doc;
  }

  async transaction(callback) {
    const session = await this.model.startSession();
    try {
      session.startTransaction();
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findWithPagination(filter, options = {}) {
    const { page = 1, limit = 10, ...rest } = options;
    const docs = await this.find(filter, { page, limit, ...rest });
    const total = await this.count(filter);

    return {
      docs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
} 