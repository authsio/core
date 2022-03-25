const params = new URLSearchParams(window.location.search)
const xApiKey = params.get('x_api_key')
if (xApiKey) {
  localStorage.setItem('x-api-key', xApiKey)
}
