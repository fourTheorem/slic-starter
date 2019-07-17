const { createSignedLink } = require('./lib/signcode')
const { getUserIdFromEmail } = require('slic-tools/get')

const signedAxios = require('aws-signed-axios')
const awsXray = require('aws-xray-sdk')
const AWS = require('aws-sdk')

const log = require('slic-tools/log')

const SQS = awsXray.captureAWSClient(
  new AWS.SQS({ endpoint: process.env.SQS_ENDPOINT_URL })
)
const SSM = awsXray.captureAWSClient(
  new AWS.SSM({ endpoint: process.env.SSM_ENDPOINT_URL })
)

const queueName = process.env.EMAIL_QUEUE_NAME
if (!queueName) {
  throw new Error('EMAIL_QUEUE_NAME must be set')
} else {
  log.info({ queueName }, 'Using queue')
}

const queueUrlPromise = fetchQueueUrl()
queueUrlPromise
  .then(() => {
    log.info('promise handled - queueUrlPromise')
  })
  .catch(err => {
    log.info('promise rejected - queueUrlPromise', err)
    console.dir(err)
  })

async function fetchQueueUrl() {
  const queueUrl = (await SQS.getQueueUrl({
    QueueName: 'dev-email-queue'
  }).promise()).QueueUrl
  log.info({ queueUrl }, 'Using queue URL')

  return queueUrl
}

const userServiceUrlPromise = getUserServiceUrl()
userServiceUrlPromise
  .then(() => {
    log.info('userServiceUrlPromise resolved')
  })
  .catch(() => {
    log.info('userServiceUrlPromise not resolved: failed')
  })
async function getUserServiceUrl() {
  const result = await SSM.getParameter({ Name: 'UserServiceUrl' }).promise()
  const {
    Parameter: { Value: userServiceUrl }
  } = result
  return userServiceUrl
}
async function create({ email, listId }) {
  let link
  let message
  const nsDomain = process.env.SLIC_NS_DOMAIN

  if(!nsDomain){
    log.info('SLIC_NS_DOMAIN must be set')
  }

  log.info('attributes in share.create: ', email, listId)
  log.info('getting collaboratorUserId ')
  const collaboratorUserId = await getUserIdFromEmail(email).then((res) => {
    
  if (collaboratorUserId == null || collaboratorUserId == []) {
    //User not signed up yet
    link = 'https://dev.sliclists.com/signup'

    message = {
      to: email,
      subject: 'You were added as a collaborator - Sign up today',
      body: `You were added as a collaborator, but it seems your not a member. Click ${link} to sign up!`
    }

  }else if(collaboratorUserId){
    log.info('result: ', res)

  log.info('got collaboratorUserId value is ', collaboratorUserId)

    link = await createSignedLink(listId, collaboratorUserId, email)
    message = {
      to: email,
      subject: 'You were added as a SLICLists Collaborator',
      body: `You were added you to a list. Click {https:/\/\sliclists.com/\invitation/\${link}} to accept`
    }
    
  //Sign the code for the invite link

  }
})
    
    //User exists, use createSignedLink function
  }
  link = 'dev.' + nsDomain + '/invitation/' + link
  log.info('Full link is: ', link)
  const params = {
    MessageBody: JSON.stringify(message),
    QueueUrl: await queueUrlPromise
  }

  log.info('attempting to send sqs message')
  const result = await SQS.sendMessage(params).promise()
  log.info({ result }, 'Send SQS Message')
}

module.exports = {
  create
}
