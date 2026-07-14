import bcrypt from 'bcryptjs';
import { settingsRepository } from '../../../infrastructure/repositories/index';
import { enqueueSync } from '../../sync/syncQueue';
import { useSettingsStore } from '../../store/useSettingsStore';

const SALT_ROUNDS = 10;

/**
 * Hashes and stores the owner's approval PIN in settings.
 * Pass null to clear/remove the PIN.
 */
export async function setOwnerPin(cafeId: string, newPin: string | null): Promise<void> {
  const existing = await settingsRepository.getSettings(cafeId);
  if (!existing) throw new Error('Settings not found for this cafe.');

  const owner_pin_hash = newPin ? bcrypt.hashSync(newPin, SALT_ROUNDS) : null;

  await settingsRepository.updateSettings(existing.id, { owner_pin_hash });
  
  const updated = { ...existing, owner_pin_hash };
  await enqueueSync('update', 'settings', updated as unknown as Record<string, unknown>);

  // Update the in-memory store so UI reflects the change immediately
  useSettingsStore.getState().setOwnerPinHash(owner_pin_hash);
}

/**
 * Verifies an entered PIN against the stored hash.
 * Returns true if the PIN matches, false otherwise.
 */
export async function verifyOwnerPin(cafeId: string, enteredPin: string): Promise<boolean> {
  const settings = await settingsRepository.getSettings(cafeId);
  if (!settings?.owner_pin_hash) return false;
  return bcrypt.compareSync(enteredPin, settings.owner_pin_hash);
}

/**
 * Returns true if the owner has set a PIN for this cafe.
 */
export async function hasOwnerPin(cafeId: string): Promise<boolean> {
  const settings = await settingsRepository.getSettings(cafeId);
  return !!(settings?.owner_pin_hash);
}
