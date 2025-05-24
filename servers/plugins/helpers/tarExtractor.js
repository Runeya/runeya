const HTTPError = require('@runeya/common-express-http-error');
const tar = require('tar-stream');
const zlib = require('zlib');

/**
 * Extract config.json from a tar archive buffer
 * @param {Buffer} tarBuffer - The tar archive buffer
 * @param {string} filename - Original filename for validation
 * @returns {Promise<Object>} - Promise that resolves to the parsed config.json content
 */
const extractConfigFromTar = (tarBuffer, filename) => {
  return new Promise((resolve, reject) => {
    if (!filename.endsWith('.tar') && !filename.endsWith('.tar.gz')) {
      return reject(new HTTPError('INVALID_FILE_TYPE: File must be a tar or tar.gz archive', 400));
    }

    // Check if the buffer is valid
    if (!tarBuffer || tarBuffer.length === 0) {
      return reject(new HTTPError('INVALID_FILE_TYPE: Empty or invalid file buffer', 400));
    }

    const extract = tar.extract();
    let configFound = false;
    let configData = null;

    extract.on('entry', (header, stream, next) => {
      if (header.name === 'config.json' || header.name.endsWith('/config.json')) {
        configFound = true;
        let data = '';
        
        stream.on('data', (chunk) => {
          data += chunk;
        });
        
        stream.on('end', () => {
          try {
            configData = JSON.parse(data);
            next();
          } catch (jsonError) {
            const errorMessage = jsonError instanceof Error ? jsonError.message : 'Invalid JSON format';
            return reject(new HTTPError('INVALID_CONFIG_JSON: ' + errorMessage, 400));
          }
        });
        
        stream.resume();
      } else {
        stream.on('end', () => {
          next();
        });
        stream.resume();
      }
    });

    extract.on('finish', () => {
      if (!configFound) {
        return reject(new HTTPError('CONFIG_NOT_FOUND: config.json file not found in the archive', 400));
      }
      resolve(configData);
    });

    extract.on('error', (err) => {
      const errorMessage = err.message || 'Unknown extraction error';
      if (errorMessage.includes('Invalid tar header')) {
        return reject(new HTTPError('INVALID_TAR_FORMAT: The file does not appear to be a valid tar archive. Please check the file format.', 400));
      }
      reject(new HTTPError('TAR_EXTRACTION_ERROR: ' + errorMessage, 400));
    });

    try {
      // Handle .tar.gz files by decompressing first
      if (filename.endsWith('.tar.gz')) {
        zlib.gunzip(tarBuffer, (err, decompressed) => {
          if (err) {
            return reject(new HTTPError('GZIP_DECOMPRESSION_ERROR: Failed to decompress .tar.gz file: ' + err.message, 400));
          }
          extract.end(decompressed);
        });
      } else {
        // Handle plain .tar files
        extract.end(tarBuffer);
      }
    } catch (err) {
      reject(new HTTPError('FILE_PROCESSING_ERROR: ' + (err instanceof Error ? err.message : 'Unknown error'), 400));
    }
  });
};

module.exports = {
  extractConfigFromTar,
}; 