const { express } = require('@clabroche/common-express');
const config = require('../models/EncryptionKey');
const dbs = require('../helpers/dbs');
const { encrypt } = require('../helpers/crypto');
const fs = require('fs').promises;
const path = require('path');
const HTTPError = require('@clabroche/common-express-http-error');
const { sockets } = require('@clabroche/common-socket-server');
const conflictStorage = require('../helpers/conflictStorage');

const router = express.Router();

router.get('/generate-key', async (req, res) => {
  res.send(await config.generateKey());
});
router.post('/encryption-key', async (req, res) => {
  const { key } = req.body;
  await config.saveKey(key);
  return res.send(key);
});
router.get('/should-setup', async (req, res) => {
  if (!config.encryptionKey) return res.json(true);
  const envSample = (await dbs.getDbs('envs'))[0];
  try {
    if (envSample) await dbs.getDb(`envs/${envSample}`).read();
    return res.json(false);
  } catch (error) {
    console.error(error);
    return res.json(true);
  }
});
router.get('/encryption-key', async (req, res) => {
  res.send(config.encryptionKey);
});
router.post('/test-encryption-key', async (req, res) => {
  const result = await config.testKey(req.body?.key || config.encryptionKey);
  if (result) return res.send('ok');
  return res.status(400).send(config.encryptionKey);
});

/**
 * Get all pending Git conflicts
 * @returns {Array} - List of pending conflicts
 */
router.get('/pending-conflicts', async (req, res) => {
  res.json(conflictStorage.getPendingConflicts());
});

/**
 * Handle resolution of git conflicts in encrypted files
 */
router.post('/resolve-conflict', async (req, res) => {
  try {
    const { original, resolution, conflictId } = req.body;
    
    if (!original || !resolution) {
      throw new HTTPError('Missing original or resolution data', 400);
    }
    
    // Extract the conflict markers to identify file location
    const headerMatch = original.match(/<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>>\s?(.*)/);
    
    if (!headerMatch) {
      throw new HTTPError('Invalid conflict format', 400);
    }
    
    // The branch name or commit hash is typically in the third capture group
    const branchIdentifier = headerMatch[3];
    
    // Get the conflict details from storage
    const conflict = conflictStorage.getPendingConflicts().find(c => c.id === conflictId);
    
    // Check if we have a file path in the conflict data
    const filePath = conflict?.filePath;
    if (!filePath) {
      console.warn(`No file path found for conflict ID: ${conflictId}`);
    }
    
    // Encrypt the resolution
    const encryptedResolution = await encrypt(resolution, { additionnalNonce: branchIdentifier });
    
    // If we have a file path, write the encrypted resolution to the file
    let fileWritten = false;
    if (filePath) {
      try {
        // Check if the file exists before writing
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        
        if (fileExists) {
          await fs.writeFile(filePath, encryptedResolution, 'utf8');
          console.log(`Conflict resolved and saved to file: ${filePath}`);
          fileWritten = true;
        } else {
          console.error(`Could not resolve conflict: file does not exist at path: ${filePath}`);
        }
      } catch (writeError) {
        // Type assertion pour éviter l'erreur 'writeError' is of type 'unknown'
        const errorMessage = writeError instanceof Error ? writeError.message : String(writeError);
        console.error('Error writing resolved file:', writeError);
        throw new HTTPError(`Failed to write to file: ${errorMessage}`, 500);
      }
    }
    
    // If a conflict ID was provided, remove it from the pending list
    if (conflictId) {
      conflictStorage.removeConflict(conflictId);
    }
    
    // Notify clients that a conflict was resolved
    sockets.emit('crypto:conflict-resolved', { conflictId });
    
    // Return the encrypted resolution and file path info
    return res.json({
      success: true,
      encryptedResolution,
      filePath,
      fileWritten
    });
  } catch (error) {
    // Type assertion for the error
    console.error('Error resolving conflict:', error);
    
    // Get the status code from the error or use 500 as default
    let statusCode = 500;
    let message = 'Failed to resolve conflict';
    
    if (error instanceof Error) {
      message = error.message;
      // Check if it's an HTTPError with a code
      if (error instanceof HTTPError && typeof error.code === 'number') {
        statusCode = error.code;
      }
    }
    
    return res.status(statusCode).json({
      success: false,
      message
    });
  }
});

module.exports = router;
