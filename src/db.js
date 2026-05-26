import Dexie from 'dexie';

export const db = new Dexie('FieldOpsDB');

db.version(1).stores({
  jobs: '++id, title, status, priority',
  syncQueue: '++id, action, payload, timestamp'
});

export const addToQueue = async (action, payload) => {
  await db.syncQueue.add({ action, payload, timestamp: new Date().toISOString() });
};

export const getPending = async () => await db.syncQueue.toArray();
export const removeFromQueue = async (id) => await db.syncQueue.delete(id);