import useNetwork from "./network.js"

const { basePath } = useNetwork()
let { headers } = useNetwork()

export default function useFetch(authToken) {
  headers = updateHeaders(authToken)

  return {
    fetchPostRequest
  }
}

function updateHeaders(authToken) {
  return {
    ...headers,
    'Authorization': `Bearer ${authToken}`
  }
}

async function fetchPostRequest(query) {
  const stringifiedBody = JSON.stringify({
    query: query
  })

  return await fetch(basePath, {
    headers: headers,
    method: "POST",
    body: stringifiedBody
  })
}