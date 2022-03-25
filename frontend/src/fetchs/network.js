
const basePath = "http://localhost:4000/graphql"

const headers = {
  'Content-Type': 'application/json',
  "x-api-key": localStorage.getItem('x-api-key'),
}

export default function useAuthNetwork() {
  return {
    basePath,
    headers
  }
}
