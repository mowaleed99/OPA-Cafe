import bcrypt from 'bcryptjs';
import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import { useSettingsStore } from '../../store/useSettingsStore';

const SALT_ROUNDS = 10;

/**
 * Hashes and stores the owner's approval PIN in settings.
 * Pass null to clear/remove the PIN.
 */
export async function setOwnerPin(cafeId: string, newPin: string | null): Promise<void> {
  const existing = await db.settings.where('cafe_id').equals(cafeId).first();
  if (!existing) throw new Error('Settings not found for this cafe.');

  const owner_pin_hash = newPin ? await bcrypt.hash(newPin, SALT_ROUNDS) : null;

  const updated = { ...existing, owner_pin_hash };
  await db.settings.put(updated);
  await enqueueSync('update', 'settings', updated as Record<string, unknown>);

  // Update the in-memory store so UI reflects the change immediately
  useSettingsStore.getState().setOwnerPinHash(owner_pin_hash);
}

/**
 * Verifies an entered PIN against the stored hash.
 * Returns true if the PIN matches, false otherwise.
 */
export async function verifyOwnerPin(cafeId: string, enteredPin: string): Promise<boolean> {
  const settings = await db.settings.where('cafe_id').equals(cafeId).first();
  if (!settings?.owner_pin_hash) return false;
  return bcrypt.compare(enteredPin, settings.owner_pin_hash);
}

/**
 * Returns true if the owner has set a PIN for this cafe.
 */
export async function hasOwnerPin(cafeId: string): Promise<boolean> {
  const settings = await db.settings.where('cafe_id').equals(cafeId).first();
  return !!(settings?.owner_pin_hash);
}
