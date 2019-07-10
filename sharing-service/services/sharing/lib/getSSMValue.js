
async function getSSMValue() {
  const params = {
    Name: 'CODE_SECRET',
    WithDecryption: true
  }

  const data = SSM.getParameter(params, (err, data) => {
    if (err) {
      console.log(err)
    }
    console.log('data:  ', data)
    return data
  })
}

module.extends = {

  getSSMValue  

}
