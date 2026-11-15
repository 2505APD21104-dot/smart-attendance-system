import mongoose from 'mongoose';
import { ActivityLog } from '../models/ActivityLog.js';
import { Notification } from '../models/Notification.js';
import { AttendanceEvent } from '../models/AttendanceEvent.js';
import { SystemAudit } from '../models/SystemAudit.js';
import { getMongoStatus } from './mongo.js';

// Map collection names to their Mongoose models
const models = {
  activity_logs: ActivityLog,
  notifications: Notification,
  attendance_events: AttendanceEvent,
  system_audits: SystemAudit,
};

class MongoNoSqlAdapter {
  constructor() {
    // We no longer use a JSON file
  }

  getModel(collectionName) {
    const model = models[collectionName];
    if (!model) throw new Error(`Collection ${collectionName} does not exist in NoSQL models.`);
    return model;
  }

  // Sync method for UI status
  getConnectionInfo() {
    const status = getMongoStatus();
    return {
      connected: status.connected,
      host: status.host || 'Disconnected',
      database: status.database || 'None',
      collections: Object.keys(models).map(name => ({
        name,
        count: 'Live in Atlas' // We don't do a sync count here to keep it fast
      })),
      indexes: ['_id', 'timestamp', 'createdAt', 'recipientId', 'sessionId']
    };
  }

  // -- ASYNC METHODS --

  async insertOne(collectionName, doc) {
    try {
      const Model = this.getModel(collectionName);
      // Generate a string ID if one wasn't provided (matches your old system)
      if (!doc._id) {
        doc._id = `${collectionName.substring(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      }
      const result = await Model.create(doc);
      return { acknowledged: true, insertedId: result._id };
    } catch (err) {
      console.error(`[Mongo insertOne Error - ${collectionName}]:`, err.message);
      throw err;
    }
  }

  async insertMany(collectionName, docs) {
    try {
      const Model = this.getModel(collectionName);
      // Ensure all have string IDs
      const formattedDocs = docs.map(doc => ({
        ...doc,
        _id: doc._id || `${collectionName.substring(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      }));
      const result = await Model.insertMany(formattedDocs);
      return { acknowledged: true, insertedCount: result.length };
    } catch (err) {
      console.error(`[Mongo insertMany Error - ${collectionName}]:`, err.message);
      throw err;
    }
  }

  async find(collectionName, filter = {}, options = {}) {
    try {
      const Model = this.getModel(collectionName);
      let query = Model.find(filter);
      
      if (options.sort) {
        query = query.sort(options.sort);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      // .lean() returns plain JS objects instead of Mongoose documents (faster & matches old behavior)
      return await query.lean();
    } catch (err) {
      console.error(`[Mongo find Error - ${collectionName}]:`, err.message);
      return []; // Degrade gracefully on read
    }
  }

  async findOne(collectionName, filter = {}) {
    try {
      const Model = this.getModel(collectionName);
      return await Model.findOne(filter).lean();
    } catch (err) {
      console.error(`[Mongo findOne Error - ${collectionName}]:`, err.message);
      return null;
    }
  }

  async updateOne(collectionName, filter, update) {
    try {
      const Model = this.getModel(collectionName);
      // Wrap in $set if it's a plain object
      const updateDoc = Object.keys(update).some(k => k.startsWith('$')) 
        ? update 
        : { $set: update };
        
      return await Model.updateOne(filter, updateDoc);
    } catch (err) {
      console.error(`[Mongo updateOne Error - ${collectionName}]:`, err.message);
      throw err;
    }
  }

  async updateMany(collectionName, filter, update) {
    try {
      const Model = this.getModel(collectionName);
      const updateDoc = Object.keys(update).some(k => k.startsWith('$')) 
        ? update 
        : { $set: update };
        
      return await Model.updateMany(filter, updateDoc);
    } catch (err) {
      console.error(`[Mongo updateMany Error - ${collectionName}]:`, err.message);
      throw err;
    }
  }

  async countDocuments(collectionName, filter = {}) {
    try {
      const Model = this.getModel(collectionName);
      return await Model.countDocuments(filter);
    } catch (err) {
      console.error(`[Mongo countDocuments Error - ${collectionName}]:`, err.message);
      return 0;
    }
  }

  async reset() {
    try {
      // Deletes all documents but keeps the collections and indexes intact
      await Promise.all(
        Object.values(models).map(Model => Model.deleteMany({}))
      );
      console.log('[Mongo] All NoSQL collections reset.');
    } catch (err) {
      console.error('[Mongo reset Error]:', err.message);
      throw err;
    }
  }
}

export const nosqlDb = new MongoNoSqlAdapter();