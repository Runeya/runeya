const { express } = require('@runeya/common-express');
const multer = require('multer');
const { extractFilesFromTar } = require('../helpers/tarExtractor');
const HTTPError = require('@runeya/common-express-http-error');
const { auth } = require('../auth/auth');
const { fromNodeHeaders } = require('better-auth/node');
const router = express.Router();
const aws = require('@aws-sdk/client-s3');
const { mongo } = require('@runeya/common-mongo');

const getSession = async (req, res, next) => {
  const headers = fromNodeHeaders(req.headers)
  await auth.api.getSession({
    headers,
  }).then(async session => {
      if(!session) return res.status(401).json({ error: 'UNAUTHORIZED' })
      const organizations = await auth.api.listOrganizations({headers})
      req.session = session
      req.organizations = organizations
      next()
    })
    .catch(error => {
      return res.status(401).json({ error: error.code || error.message })
    });
}

router.post('/upload', getSession, multer().single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'NO_FILE_PROVIDED',
      message: 'No file was uploaded'
    });
  }

  const extractedFiles = await extractFilesFromTar(req.file.buffer, req.file.originalname, ['config.json', 'README.md']);
  const configData = extractedFiles['config.json'];
  const readmeData = extractedFiles['README.md'];
  
  const availableNamespaces = req.organizations.map(organization => `@${organization.slug}`)
  const namespace = configData.name.split('/')[0]
  if(!configData.name) {
    throw new HTTPError('Name is required in the config.json file.', '400.1984598')
  }

  if(!availableNamespaces.includes(namespace)) {
    throw new HTTPError(`Invalid namespace, available namespaces: ${availableNamespaces.join(', ')}, current namespace: ${namespace}`, '400.74549874')
  }

  const s3 = new aws.S3Client({
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || '',
      secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
    endpoint: process.env.S3_ENDPOINT || '',
    region: process.env.S3_REGION || 'us-east-1',
  })

  await s3.send(new aws.PutObjectCommand({
    Bucket: process.env.S3_PLUGIN_BUCKET || '',
    Key: `${configData.name}/${configData.version}.tar.gz`,
    Body: req.file.buffer
  }))

  await s3.send(new aws.PutObjectCommand({
    Bucket: process.env.S3_PLUGIN_BUCKET || '',
    Key: `${configData.name}/latest.tar.gz`,
    Body: req.file.buffer
  }))

  const plugin = {
    name: configData.name,
    version: configData.version,
    description: configData.description,
    readme: readmeData || configData.readme,
    namespace: namespace,
    config: configData,
    updatedAt: new Date(),
  }

  const versionKey = {name: configData.name, version: configData.version}
  const latestKey = {...versionKey, version: 'latest'}
  await mongo.collection('plugins').replaceOne(versionKey, plugin, {upsert: true})
  await mongo.collection('plugins').replaceOne(latestKey, {...plugin, version: 'latest'}, {upsert: true})

  res.json({
    message: 'Plugin uploaded and config extracted successfully',
    config: configData
  });

});

router.get('/download/:pluginName/:version?', async (req, res) => {
  const pluginName = req.params.pluginName;
  const version = req.params.version || 'latest';
  
  const plugin = await mongo.collection('plugins').findOne({
    name: pluginName,
    version: version === 'latest' ? 'latest' : version
  });
  
  if (!plugin) {
    return res.status(404).json({
      error: 'PLUGIN_NOT_FOUND',
      message: 'Plugin not found'
    });
  }

  const s3 = new aws.S3Client({
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || '',
      secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
    endpoint: process.env.S3_ENDPOINT || '',
    region: process.env.S3_REGION || 'us-east-1',
  });

  try {
    const key = `${pluginName}/${version}.tar.gz`;
    const command = new aws.GetObjectCommand({
      Bucket: process.env.S3_PLUGIN_BUCKET || '',
      Key: key
    });

    const response = await s3.send(command);
    
    if (!response.Body) {
      return res.status(404).json({
        error: 'FILE_NOT_FOUND',
        message: 'Plugin file not found in storage'
      });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="${pluginName}-${version}.tar.gz"`);
    
    // Convert S3 response body to buffer and send
    const bodyBytes = await response.Body.transformToByteArray();
    const buffer = Buffer.from(bodyBytes);
    res.send(buffer);
    
  } catch (error) {
    console.error('Error downloading plugin:', error);
    return res.status(500).json({
      error: 'DOWNLOAD_ERROR',
      message: 'Error downloading plugin file'
    });
  }
});

router.get('/list', async (req, res) => {
  const plugins = await mongo.collection('plugins').aggregate([
    { $match: {
      $and: [
        req.query.q || {},
        {version: {$ne: 'latest'}}
      ]
    } },
    { $sort: { updatedAt: -1 } },
    { $group: {
      _id: '$name',
      name: { $first: '$name' },
      description: { $first: '$description' },
      namespace: { $first: '$namespace' },
      readme: { $first: '$readme' },
      config: { $first: '$config' },
      updatedAt: { $first: '$updatedAt' },
      versions: { $push: {
        version: '$version',
        updatedAt: '$updatedAt'
      } },
      requirements: { $first: '$requirements' },
    } },
   
    { $limit: 100 }
  ]).toArray()
  
  res.json({
    plugins: plugins
  });
});

router.get('/:pluginName', async (req, res) => {
  const pluginName = req.params.pluginName;
  
  const plugin = await mongo.collection('plugins').aggregate([
    { $match: { 
      name: pluginName,
      version: { $ne: 'latest' }
    } },
    { $sort: { updatedAt: -1 } },
    { $group: {
      _id: '$name',
      name: { $first: '$name' },
      description: { $first: '$description' },
      namespace: { $first: '$namespace' },
      readme: { $first: '$readme' },
      config: { $first: '$config' },
      updatedAt: { $first: '$updatedAt' },
      requirements: { $first: '$requirements' },
      versions: { $push: {
        version: '$version',
        updatedAt: '$updatedAt'
      } },
    } }
  ]).toArray()
  
  if (plugin.length === 0) {
    return res.status(404).json({
      error: 'PLUGIN_NOT_FOUND',
      message: 'Plugin not found'
    });
  }
  
  res.json({
    plugin: plugin[0]
  });
});

module.exports = router;
