const https = require('https')
const http = require('http')
const querystring = require('querystring')

class Client {
  constructor(input_options) {
    let options = input_options || {}
    this.protocol = options.protocol || 'http'
    this.user = options.user || undefined
    this.password = options.password || undefined
    this.host = options.host || '127.0.0.1'
    this.port = options.port || ((this.protocol === 'https') ? 8443 : 8080)
    this.agent = (this.protocol==='https') ? https : http
    this.method = options.method || "POST"
    this.path = options.path || '/'
    this.authData = (this.user && this.password) ? (this.user + ':' + this.password) : undefined
  }

  callPromise(method = '', params = [], jsonrpc = 2.0) {
    return new Promise((resolve, reject) => {
      let requestData = {
        id: parseInt(Math.random() * 100000),
        method: method,
        params: params,
        jsonrpc: jsonrpc
      }
      requestData = JSON.stringify(requestData)
      if (this.method === 'GET') {
        requestData = querystring.escape(requestData)
      }

      let requestOptions = {
        agent: this.agent.globalAgent,
        method: this.method,
        host: this.host,
        port: this.port,
        path: (this.method === 'GET') ? (this.path + requestData) : this.path,
        headers: {
          'content-type': (this.method === 'POST') ? 'application/x-www-form-urlencoded' : 'application/json',
          'content-length': (requestData).length
        }
      }
      if (this.authData) {
        requestOptions.auth = this.authData
      }

      let request = this.agent.request(requestOptions)
      request.on('error', err => {
        reject(err)
      })
      request.on('response', (res) => {
        let data = ''
        res.on('data', (byte_data) => {
          data += byte_data
        })
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 304) {
            if (data.length > 0) {
              try {
                resolve(JSON.parse(data))
              } catch (err) {
                reject(data, res.statusCode)
              }
            }
          } else {
            reject(data, res.statusCode)
          }
        })
      })
      request.end(requestData)
    })
  }
}

module.exports = Client
