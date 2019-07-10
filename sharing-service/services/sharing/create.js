'use strict'
const {getUser} = require('../../../slic-tools/user-tools/get')
const { createResponse } = require('../../../slic-tools/response')
const share = require('./share')
const { processEvent } = require('../../../slic-tools/event-util')

async function main(event) {
  const {body} = processEvent(event)
  const {email, userId, listId} = body

  const response = await getUser(email)
  
  if(!response){
    //TODO: Check if response contains a userID, if not user doesn't exist
      return null
  }

  
  return createResponse(share.create({ email, userId, listId }), {
    successCode: 201
  })
}

module.exports = { main }
