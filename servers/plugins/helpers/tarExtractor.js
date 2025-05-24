const HTTPError = require('@runeya/common-express-http-error');
const tar = require('tar-stream');
const zlib = require('zlib');

/**
 * Extract specific files from a tar archive buffer
 * @param {Buffer} tarBuffer - The tar archive buffer
 * @param {string} filename - Original filename for validation
 * @param {Array<string>} [filePaths] - Optional array of specific file paths to extract. If not provided, extracts all files.
 * @returns {Promise<Object|Array>} - Promise that resolves to an object with file paths as keys and content as values, or array if no filePaths specified
 */
const extractFilesFromTar = (tarBuffer, filename, filePaths = undefined) => {
  return new Promise((resolve, reject) => {
    if (!filename.endsWith('.tar') && !filename.endsWith('.tar.gz')) {
      return reject(new HTTPError('INVALID_FILE_TYPE: File must be a tar or tar.gz archive', 400));
    }

    // Check if the buffer is valid
    if (!tarBuffer || tarBuffer.length === 0) {
      return reject(new HTTPError('INVALID_FILE_TYPE: Empty or invalid file buffer', 400));
    }

    const extract = tar.extract();
    const extractedFiles = [];
    const requestedFiles = {};
    
    // Normalize file paths (remove leading slashes for comparison)
    const normalizedFilePaths = filePaths ? filePaths.map(path => path.replace(/^\/+/, '')) : null;

    extract.on('entry', (header, stream, next) => {
      // Skip directories
      if (header.type === 'directory') {
        stream.on('end', () => {
          next();
        });
        stream.resume();
        return;
      }

      const normalizedHeaderName = header.name.replace(/^\/+/, '');
      
      // If specific files requested, check if this file is in the list
      if (normalizedFilePaths && !normalizedFilePaths.includes(normalizedHeaderName)) {
        stream.on('end', () => {
          next();
        });
        stream.resume();
        return;
      }

      let data = Buffer.alloc(0);
      
      stream.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
      });
      
      stream.on('end', () => {
        try {
          const fileInfo = {
            name: header.name,
            path: header.name,
            size: header.size,
            mode: header.mode,
            type: header.type,
            mtime: header.mtime,
            buffer: data,
            content: data.toString('utf8') // Text content for easy access
          };

          // Try to parse as JSON if it's a .json file
          if (header.name.endsWith('.json')) {
            try {
              fileInfo.json = JSON.parse(data.toString('utf8'));
            } catch (jsonError) {
              // Keep the raw content if JSON parsing fails
              fileInfo.jsonError = jsonError instanceof Error ? jsonError.message : 'Invalid JSON format';
            }
          }

          if (normalizedFilePaths) {
            // Store with original requested path format
            const originalPath = filePaths && filePaths.find(path => path.replace(/^\/+/, '') === normalizedHeaderName);
            requestedFiles[originalPath] = fileInfo.json || fileInfo.content;
          } else {
            extractedFiles.push(fileInfo);
          }
          
          next();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'File processing error';
          return reject(new HTTPError('FILE_PROCESSING_ERROR: ' + errorMessage, 400));
        }
      });
      
      stream.resume();
    });

    extract.on('finish', () => {
      if (normalizedFilePaths) {
        // Check if all requested files were found
        const missingFiles = filePaths ? filePaths.filter(path => !(path in requestedFiles)) : [];
        if (missingFiles.length > 0) {
          return reject(new HTTPError(`FILES_NOT_FOUND: The following files were not found in the archive: ${missingFiles.join(', ')}`, 400));
        }
        resolve(requestedFiles);
      } else {
        resolve(extractedFiles);
      }
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

/**
 * Extract config.json from a tar archive buffer (legacy function for backward compatibility)
 * @param {Buffer} tarBuffer - The tar archive buffer
 * @param {string} filename - Original filename for validation
 * @returns {Promise<Object>} - Promise that resolves to the parsed config.json content
 */
const extractConfigFromTar = async (tarBuffer, filename) => {
  const files = await extractFilesFromTar(tarBuffer, filename);
  
  const configFile = files.find(file => 
    file.name === 'config.json' || file.name.endsWith('/config.json')
  );
  
  if (!configFile) {
    throw new HTTPError('CONFIG_NOT_FOUND: config.json file not found in the archive', 400);
  }
  
  if (configFile.jsonError) {
    throw new HTTPError('INVALID_CONFIG_JSON: ' + configFile.jsonError, 400);
  }
  
  return configFile.json;
};

module.exports = {
  extractConfigFromTar,
  extractFilesFromTar,
}; 