import useFetch from "./fetch"
let fetchData

export default function useRetrieveProjects(authToken) {
  const { fetchPostRequest } = useFetch(authToken)
  fetchData = fetchPostRequest

  return {
    createProject
  }
}

function getCreateProjectMutation(projectName) {
  return `mutation Mutation {
    createProject(projectName: "${projectName}") {
      publicKey
      privateKey
      projectId
    }
  }`
}

async function createProject(projectName) {
  const response = await fetchData(getCreateProjectMutation(projectName))

  const json = await response.json()
  const { data, error } = getDataOrError(json)

  if (error) {
    const dataNotFound = error === "Failed to create project"
    const message = dataNotFound
      ? `Failed to create project '${projectName}'.`
      : error

    alert(message)

    return
  }

  const isNotSuccess = !data
  if (isNotSuccess) {
    alert("Something went wrong. If the message perssits, kindly contact Authsio.com")
    return
  }

  alert(`Successfully created project ${projectName}. Redirecting you to your dashboard.`);

  const { projectId } = data
  return projectId
}

function getDataOrError(json) {
  const hasErrors = !!json.errors
  if (hasErrors) {
    const firstError = json.errors[0].extensions.exception.errors[0].message
    return { error: firstError }
  }

  return { data: json.data.createProject }
}


