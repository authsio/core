import useFetch from "./fetch"
let fetchData

export default function useRetrieveProjects(authToken) {
  const { fetchPostRequest } = useFetch(authToken)
  fetchData = fetchPostRequest

  return {
    deleteProject
  }
}

function getDeleteProjectMutation(projectId) {
  return `mutation Mutation {
    deleteProjects(
      projectIds: ["${projectId}"],
    ) {
      name
    }
  }`
}

async function deleteProject(projectId, projectName) {
  const response = await fetchData(getDeleteProjectMutation(projectId, projectName))

  const json = await response.json()
  const { data, error } = getDataOrError(json)

  if (error) {
    const dataNotFound = error === "Failed to delete project"
    const message = dataNotFound
      ? `Failed to delete project '${projectName}'.`
      : error

    alert(message)

    return
  }

  const isNotSuccess = !data
  if (isNotSuccess) {
    alert("Something went wrong. If the message perssits, kindly contact Authsio.com")
    return
  }

  alert(`Successfully deleted project ${projectName}. Redirecting you to your dashboard.`);

  const { id: returnedId } = data
  return returnedId
}

function getDataOrError(json) {
  const hasErrors = !!json.errors
  if (hasErrors) {
    const firstError = json.errors[0].extensions.exception.errors[0].message
    return { error: firstError }
  }

  return { data: json.data.deleteProject }
}


