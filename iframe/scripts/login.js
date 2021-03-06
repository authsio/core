import useNetwork from "./network.js"

const { basePath, headersWithJWT } = useNetwork()

window.login = submitLoginForm

async function submitLoginForm(event) {
  const formElement = event.target
  await handleLogin(formElement)
}

async function handleLogin(form) {
  const userData = [... new FormData(form).values()]
  const response = await login(userData)

  const json = await response.json()
  const { data, error } = getDataOrError(json)

  if (error) {
    const emailNotFound = error === "email does not exist"
    const message = emailNotFound
      ? "No user were found with this email address. Please try another one."
      : error

    alert(message)

    return
  }

  const isNotSuccess = data.message !== "SUCCESS"
  if (isNotSuccess) {
    alert("Something went wrong. If the message perssits, kindly contact Authsio.com")
    return
  }

  localStorage.jwt = data.token

  const successMessage = "You have successfully logged in. You will be redirected to your platform."
  alert(successMessage)

  window.location = `http://localhost:3000?x_api_key=${localStorage.getItem('x-api-key')}&auth_token=${localStorage.getItem('jwt')}`
}

function getDataOrError(json) {
  const hasErrors = !!json.errors
  if (hasErrors) {
    const firstError = json.errors[0].extensions.exception.errors[0].message
    return { error: firstError }
  }

  return { data: json.data.login }
}

async function login([email, password]) {
  const stringifiedBody = JSON.stringify({
    query: `query Query{
      login(
        data: {
          email: "${email}"
          password: "${password}"
        }
      ) {
        token
        message
      }
    }`
  })

  return await fetch(basePath, {
    headers: headersWithJWT,
    method: "POST",
    body: stringifiedBody
  })
}