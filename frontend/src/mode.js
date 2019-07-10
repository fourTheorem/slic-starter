const region = process.env.REACT_APP_AWS_REGION

export const localMode =
  process.env.NODE_ENV !== 'production' && (!region || region === 'localhost')
export const simulatedAuth = localMode
