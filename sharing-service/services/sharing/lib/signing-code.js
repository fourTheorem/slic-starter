'use strict'

const crypto = require('crypto')

module.exports = function(defaultSecret) {
  function getSecret() {
    return process.env.SIGNED_CODE_SECRET || defaultSecret
  }

  function getDigest(data) {
    const hmac = crypto.createHmac('sha256', getSecret())
    hmac.update(data, 'hex')
    return hmac.digest('base64')
  }

  return {
    sign: function sign(hex) {
      if (!/^[a-hA-H0-9]{24}$/.test(hex)) {
        throw new Error('Invalid data for code: ' + hex)
      }
      const encData = new Buffer(hex, 'hex').toString('base64')
      const result = `${encData}${getDigest(hex)}`
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .split('')
        .reverse()
        .join('')
      return result
    },

    /**
     * Decodes a signed code+HMAC and returns the decoded data if the HMAC is verified
     *
     * @param {string} code base64-encoded data with HMAC
     * @return {string} The original hexadecimal string data or `null` if verification failed.
     */
    unsign: function unsign(code) {
      if (code.length < 17) {
        return null
      }
      const normalised = code
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .split('')
        .reverse()
        .join('')
      const padded = normalised + Array(5 - (normalised.length % 4)).join('=')
      // 24-hex chars always encodes to 16 base64 characters
      const encData = padded.substring(0, 16)
      const digest = padded.substring(16)
      const data = new Buffer(encData, 'base64').toString('hex')
      if (getDigest(data) === digest) {
        return data
      }
      return null
    }
  }
}
