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
      projectIds: ["${projectId}"]
    )
  }`
}

async function deleteProject(projectId, projectName) {
  const response = await fetchData(getDeleteProjectMutation(projectId))

  const json = await response.json()
  const { wasDeleted, error } = getDataOrError(json)

  if (error) {
    const dataNotFound = error === "Failed to delete project"
    const message = dataNotFound
      ? `Failed to delete project '${projectName}'.`
      : error

    alert(message)

    return
  }

  return wasDeleted
}

function getDataOrError(json) {
  const hasErrors = !!json.errors
  if (hasErrors) {
    const firstError = json.errors[0].extensions.exception.errors[0].message
    return { error: firstError }
  }

  return { wasDeleted: json.data.deleteProjects }
}


