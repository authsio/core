import useFetch from "./fetch"
let fetchData

export default function useRetrieveProjects(authToken) {
  const { fetchPostRequest } = useFetch(authToken)
  fetchData = fetchPostRequest

  return {
    fetchProjects
  }
}

function getFetchProjectsQuery() {
  return `query Me {
    me {
      id
      email
      projects {
        id
        projectId
        name
      }
    }
  }`
}

async function fetchProjects() {
  const response = await fetchData(getFetchProjectsQuery())

  const json = await response.json()
  const { data, error } = getDataOrError(json)

  if (error) {
    const dataNotFound = error === "Email not found"
    const message = dataNotFound
      ? "No data was found for this email address. "
      : error

    alert(message)

    return
  }

  const isNotSuccess = !data
  if (isNotSuccess) {
    alert("Something went wrong. If the message perssits, kindly contact Authsio.com")
    return
  }

  console.info("Successfully fetched dashboard data.");

  const { projects } = data
  return projects
}

function getDataOrError(json) {
  const hasErrors = !!json.errors
  if (hasErrors) {
    const firstError = json.errors[0].extensions.exception.errors[0].message
    return { error: firstError }
  }

  return { data: json.data.me }
}


