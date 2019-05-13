const AWS = require('aws-sdk')
const SQS = new AWS.SQS()

const queueName = process.env.EMAIL_QUEUE_NAME
if (!queueName) {
  throw new Error('EMAIL_QUEUE_NAME must be set')
}

// Get the queue here using the queue name
// (GetQueueUrl)

async function handleNewChecklist(event) {
  var params = {
    MessageAttributes: {
      Title: {
        DataType: 'String',
        StringValue: 'The Whistler'
      },
      Author: {
        DataType: 'String',
        StringValue: 'John Grisham'
      },
      WeeksOn: {
        DataType: 'Number',
        StringValue: '6'
      }
    },
    MessageBody: 'This is another message from handleNewChecklist',
    QueueUrl:
      'https://sqs.eu-west-1.amazonaws.com/935672627075/EmailServiceSQS.fifo',
    MessageGroupId: 'EmailGroup'
  }

  // queue.sendMessage
  await SQS.sendMessage(params, (err, data) => {
    if (err) {
      console.log(err)
    } else {
      console.log('success', data.MessageId)
    }
  })
}

handleNewChecklist()
