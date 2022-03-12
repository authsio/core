
const basePath = "http://localhost:4000/graphql"

const headers = {
  'Content-Type': 'application/json',
  "x-api-key": "428bc20b5c5c7dec",
}

export default function useAuseNetwork() {
  return {
    basePath,
    headers
  }
}
