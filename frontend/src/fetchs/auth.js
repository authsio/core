const basePath = "http://localhost:4000/graphql"

export default function useAuth() {
  return {
    register
  }
}

async function register({email, password, firstName, lastName}) {
  const stringifiedBody = JSON.stringify({
    query: `mutation Register {
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
  })

  const response = await fetch(basePath, {
    headers: {
      'Content-Type': 'application/json',
      "x-api-key": "b3d88ce250dd3166",
    },
    method: "POST",
    body: stringifiedBody
  })

  const json = await response.json()
  const registerData = json.data.register

  return registerData
}