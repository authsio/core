const loginForm = document.getElementById('login-form')

async function onSubmitLoginForm() {
  const formData = new FormData(loginForm)
  const dataObject = getDataObject(formData)

  try{
    const response = await fetch('https://www.authsio.com/login', {
      body: JSON.stringify(dataObject),
      method: 'POST'
    })

    console.log(response);
  } catch (error) {
    console.error("Failed to login:\n",error)
  }
}


function getDataObject(formData) {
  let dataObject = {}

  for (var value of formData.entries()) {
    dataObject[value[0]] = value[1]
  }

  return dataObject
}


