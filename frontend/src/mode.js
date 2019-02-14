const region = process.env.REACT_APP_AWS_REGION

export const simulatedAuth =
  process.env.NODE_ENV !== 'production' && (!region || region === 'localhost')
