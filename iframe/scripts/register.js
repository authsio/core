import useNetwork from "./network.js"

const { basePath, headers } = useNetwork()

window.register = submitRegistrationForm

async function submitRegistrationForm(event) {
  const formElement = event.target
  await handleRegistration(formElement)
}

async function handleRegistration(form) {
  const userData = [... new FormData(form).values()]
  const response = await register(userData)

  const json = await response.json()
  const { data, error } = getDataOrError(json)

  if (error) {
    const emailNotUnique = error === "email must be unique"
    const message = emailNotUnique
      ? "A user with this email already exists."
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

  const successMessage = "You have been successfully registered. You will be redirected to the login page."
  alert(successMessage)
  window.location.pathname = "/"
}

function getDataOrError(json) {
  const hasErrors = !!json.errors
  if (hasErrors) {
    const firstError = json.errors[0].extensions.exception.errors[0].message
    return { error: firstError }
  }
  return { data: json.data.register }
}

async function register([email, password, firstName, lastName]) {

  const stringifiedBody = JSON.stringify({
    query: `mutation Mutation {
      register(
        data: {
          email: "${email}"
          password: "${password}"
          firstName: "${firstName}"
          lastName: "${lastName}"
        }
      ) {
        token
        message
      }
    }`
  }
  )

  return await fetch(basePath, {
    headers: headers,
    method: "POST",
    body: stringifiedBody
  })
}