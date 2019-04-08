const got = require('got')
const { parse } = require('querystring')

function getNowClient(token) {
  const authorizationHeader = { Authorization: `Bearer ${token}` }
  const client = {
    secrets: {
      add: async options => {
        const { name, value } = options
        const response = await got.post('https://api.zeit.co/v2/now/secrets', {
          body: JSON.stringify({ name, value }),
          headers: authorizationHeader
        })
        return response.body
      },
      list: async () => {
        const response = await got('https://api.zeit.co/v2/now/secrets', {
          headers: authorizationHeader
        })
        return response.body
      }
    }
  }
  return client
}

async function getLastSecret(req, res) {
  const response = await now.secrets.list()
  const { secrets } = JSON.parse(response)
  res.setHeader('Content-Type', 'application/json')
  return res.end(`Name=${secrets[secrets.length - 1].name}`)
}

async function deployRoute(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 404
    return res.end()
  }
  const body = []
  req.on('data', chunk => {
    body.push(chunk)
  })
  req.on('end', async () => {
    const { APP_ID, WEBHOOK_SECRET, PRIVATE_KEY, ZEIT_TOKEN } = parse(
      body.toString()
    )
    const nowClient = getNowClient(ZEIT_TOKEN)
    await nowClient.secrets.add({
      name: `${APP_ID}-test-app-id`,
      value: APP_ID
    })
    await nowClient.secrets.add({
      name: `${APP_ID}-test-webhook-secret`,
      value: WEBHOOK_SECRET
    })
    await nowClient.secrets.add({
      name: `${APP_ID}-test-private-key`,
      value: PRIVATE_KEY
    })
    return res.end(
      `Secrets added: APP_ID=${APP_ID}, PRIVATE_KEY=${PRIVATE_KEY}, WEBHOOK_SECRET=${WEBHOOK_SECRET}`
    )
  })
}

module.exports = async (req, res) => {
  try {
    return deployRoute(req, res)
  } catch (err) {
    res.write(JSON.stringify('hmm'))
    console.log(err)
    return res.end()
  }
}
