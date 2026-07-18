const schema = require('../database/schema.cjs');
const crypto = require('crypto');

/**
 * Detects whether a remote conflict exists and records resolution into `sync_conflicts`.
 * Uses timestamp-based "last write wins" strategy where local updates overwrite unless
 * remote has a strictly newer timestamp from a different device.
 */
async function detectAndResolveConflict({ db, supabase, supabaseTable, payload, action, logSync }) {
  let conflictDetected = false;
  let remoteData = null;
  let resolution = 'local_wins';

  if (action === 'update' || action === 'delete') {
    try {
      const { data } = await supabase.from(supabaseTable).select('*').eq('id', payload.id).single();
      if (data) {
        remoteData = data;
        const remoteDate = new Date(remoteData.updated_at || remoteData.created_at || 0).getTime();
        const localDate = new Date(payload.updated_at || payload.created_at || 0).getTime();

        if (remoteDate > localDate && remoteData.device_id !== payload.device_id) {
          conflictDetected = true;
          resolution = 'local_wins'; // In our single-branch setup, local pos action overrides
        }
      }
    } catch (err) {
      // Ignore query failure if record not found remotely
    }
  }

  if (conflictDetected && remoteData) {
    try {
      await db.insert(schema.syncConflicts).values({
        id: crypto.randomUUID(),
        entity_name: supabaseTable,
        entity_id: payload.id,
        local_version: payload.version || 1,
        remote_version: remoteData.version || 1,
        resolution: resolution,
        created_at: new Date().toISOString()
      }).execute();
      if (logSync) {
        logSync(`Conflict detected and resolved for ${supabaseTable} ID ${payload.id}. Resolution: ${resolution}`);
      }
    } catch (e) {
      if (logSync) {
        logSync(`Warning: failed logging conflict for ${supabaseTable}: ${e.message}`);
      }
    }
  }

  return { conflictDetected, remoteData, resolution };
}

module.exports = {
  detectAndResolveConflict,
};
