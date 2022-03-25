const basePath = "http://localhost:4000/graphql"

const headers = {
  'Content-Type': 'application/json',
  "x-api-key": localStorage.getItem('x-api-key'),
}

const headersWithJWT = {
  ...headers,
  "Authorization": `Bearer ${localStorage.jwt}`
}

export default function useAuseNetwork() {
  return {
    basePath,
    headers,
    headersWithJWT
  }
}
