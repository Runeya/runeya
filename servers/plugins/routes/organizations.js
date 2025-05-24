const { express } = require('@runeya/common-express');
const { auth } = require('../auth/auth');
const { fromNodeHeaders } = require('better-auth/node');
const { mongo } = require('@runeya/common-mongo');

const router = express.Router();
router.get('/my-invitations', async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  const email = session?.user?.email;
  if(!email) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }
  const invitations = await mongo.collection('invitation').aggregate([
    {
      $match: {
        email: email,
        status: 'pending',
        expiresAt: { $gt: new Date() }
      }
    },
    {
      $lookup: {
        from: 'organization',
        localField: 'organizationId',
        foreignField: '_id',
        as: 'organization'
      },
    },
    {$unwind: '$organization'}
  ]).toArray();

  console.log(JSON.stringify(['stack-monitor', invitations],(_, v) => (typeof v === 'function' ? `[func]` : v)));

  res.json({
    invitations
  });
});


module.exports = router;
