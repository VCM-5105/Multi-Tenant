import crypto from "crypto";
import pool from "../config/db.js";


export const recordActivity = async ({
  agencyId,
  actorId,
  actorType,
  eventType,
  relatedEntityType,
  relatedEntityId,
  visibility = "internal",
  metadata = null,
}) => {
  try {
    const id = "act-" + crypto.randomUUID().slice(0, 8);
    await pool.query(
      `INSERT INTO activity_logs 
        (id, agency_id, actor_id, actor_type, event_type, related_entity_type, related_entity_id, visibility, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        agencyId || null,
        actorId,
        actorType,
        eventType,
        relatedEntityType,
        relatedEntityId,
        visibility,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );
  } catch (err) {
    console.error("[ACTIVITY LOG ERROR]", err.message);
  }
};
