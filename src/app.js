const fs = require('fs')

// Pages that get served from now statically, but
// need a dev server route for codesandbox
const setupPage = fs.readFileSync('./views/setup.html')
const successPage = fs.readFileSync('./views/success.html')

// The main lambda function
const lambda = require('./lambda')

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.url === '/setup') return res.end(setupPage)
  if (req.url === '/success') return res.end(successPage)
  if (req.url === '/deploy') return lambda(req, res)
}
