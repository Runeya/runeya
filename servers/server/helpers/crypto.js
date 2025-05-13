const _sodium = require('libsodium-wrappers');
const crypto = require('crypto');
const { sockets } = require('@runeya/common-socket-server');
const conflictStorage = require('./conflictStorage');
const path = require('path');

module.exports.generateKey = async () => {
  await _sodium.ready;
  const sodium = _sodium;
  const key = sodium.crypto_aead_aegis256_keygen();
  return sodium.to_base64(key);
};

module.exports.encrypt = async (data, { additionnalNonce = '', encryptionKey = '' } = {}) => {
  await _sodium.ready;
  const sodium = _sodium;
  if (!encryptionKey) encryptionKey = require('../models/EncryptionKey').encryptionKey;
  const key = sodium.from_base64(encryptionKey);
  if (!key || key.length !== sodium.crypto_secretbox_KEYBYTES) {
    throw new Error('Invalid encryption key length');
  }

  let nonce;
  if (additionnalNonce) {
    const combinedHash = crypto.createHash('blake2b512').update(data + additionnalNonce).digest();
    nonce = combinedHash.slice(0, sodium.crypto_secretbox_NONCEBYTES); // Truncate to the required size
  } else {
    nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  }

  // Convert data to string if it's not already
  const dataStr = typeof data === 'string' ? data : String(data);
  
  // Conversion explicite en Uint8Array pour éviter les erreurs de type
  const dataArray = new TextEncoder().encode(dataStr);
  
  const ciphertext = sodium.crypto_secretbox_easy(dataArray, nonce, key);

  return Buffer.concat([
    Buffer.from(nonce.buffer, nonce.byteOffset, nonce.byteLength),
    Buffer.from(ciphertext.buffer, ciphertext.byteOffset, ciphertext.byteLength)
  ]).toString('base64');
};

/**
 * Decrypt data from a specific file path
 * @param {string} encryptedData - The data to decrypt
 * @param {Object} options - Decryption options
 * @param {string} filePath - The path of the file being decrypted
 * @returns {Promise<string>} - The decrypted data
 */
module.exports.decryptFile = async (encryptedData, options = {}, filePath) => {
  // Check if the data contains git conflict markers
  if (typeof encryptedData === 'string' && (
    encryptedData.includes('<<<<<<< HEAD') || 
    encryptedData.includes('=======') || 
    encryptedData.includes('>>>>>>>'))
  ) {
    // Pass the file path to handleGitConflict
    return await handleGitConflict(encryptedData, options, filePath);
  }

  // Use the regular decrypt function for non-conflicted data
  return await module.exports.decrypt(encryptedData, options);
};

module.exports.decrypt = async (encryptedData, { additionnalNonce = '', encryptionKey = '' } = {}) => {
  // Check if the data contains git conflict markers
  if (typeof encryptedData === 'string' && (
    encryptedData.includes('<<<<<<< HEAD') || 
    encryptedData.includes('=======') || 
    encryptedData.includes('>>>>>>>'))
  ) {
    return await handleGitConflict(encryptedData, { additionnalNonce, encryptionKey });
  }

  await _sodium.ready;
  const sodium = _sodium;

  if (!encryptionKey) encryptionKey = require('../models/EncryptionKey').encryptionKey;
  const key = sodium.from_base64(encryptionKey);
  if (!key || key.length !== sodium.crypto_secretbox_KEYBYTES) {
    throw new Error('Invalid decryption key length');
  }
  const encryptedBuffer = Buffer.from(encryptedData, 'base64');

  const nonce = encryptedBuffer.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = encryptedBuffer.slice(sodium.crypto_secretbox_NONCEBYTES);

  let decrypted;
  try {
    // Convert buffers to Uint8Array to ensure compatibility with libsodium
    const ciphertextArray = new Uint8Array(ciphertext);
    const nonceArray = new Uint8Array(nonce);
    
    decrypted = sodium.crypto_secretbox_open_easy(ciphertextArray, nonceArray, key);
  } catch (error) {
    throw new Error('Decryption failed');
  }

  if (!decrypted) {
    throw new Error('Decryption failed');
  }

  return Buffer.from(decrypted).toString('utf-8');
};

/**
 * Handle decryption of git conflicted files
 * @param {string} conflictedData - The data with git conflict markers
 * @param {Object} options - Decryption options
 * @param {string} [filePath] - Path to the file containing the conflict
 * @returns {Promise<string>} - The decrypted data with conflict markers preserved
 */
async function handleGitConflict(conflictedData, options, filePath) {
  // Split the data by conflict markers
  const headMatch = conflictedData.match(/<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>>.*/);
  
  if (!headMatch) {
    // If we can't properly parse the conflict, return the original error
    throw new Error('Git conflict detected but could not be properly parsed');
  }

  try {
    // Extract the different versions
    const ourVersion = headMatch[1];
    const theirVersion = headMatch[2];
    
    // Try to decrypt both versions
    let ourDecrypted = '';
    let theirDecrypted = '';
    
    try {
      ourDecrypted = await module.exports.decrypt(ourVersion, options);
    } catch (err) {
      // Type assertion for the error
      const errorMessage = err instanceof Error ? err.message : String(err);
      ourDecrypted = `[ERROR DECRYPTING OUR VERSION: ${errorMessage}]`;
    }
    
    try {
      theirDecrypted = await module.exports.decrypt(theirVersion, options);
    } catch (err) {
      // Type assertion for the error
      const errorMessage = err instanceof Error ? err.message : String(err);
      theirDecrypted = `[ERROR DECRYPTING THEIR VERSION: ${errorMessage}]`;
    }
    
    // Create conflict object
    const conflictData = {
      original: conflictedData,
      ourVersion: ourDecrypted,
      theirVersion: theirDecrypted,
      filePath: filePath || null,
      filename: filePath ? path.basename(filePath) : null
    };
    
    // Store the conflict and get the ID
    const conflictId = conflictStorage.storeConflict(conflictData);
    conflictData.id = conflictId;
    
    // Emit a socket event with both versions
    sockets.emit('crypto:conflict', conflictData);
    
    // Return a formatted conflict with the decrypted content
    return `${JSON.stringify({
      ourVersion: ourDecrypted,
      theirVersion: theirDecrypted
    })}`;
    
  } catch (error) {
    // Type assertion for the error
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error handling git conflict:', errorMessage);
    throw new Error(`Git conflict detected, but failed to process: ${errorMessage}`);
  }
}
