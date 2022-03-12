import useFetch from "./fetch"
let fetchData

export default function useRetrieveProjects(authToken) {
  const { fetchPostRequest } = useFetch(authToken)
  fetchData = fetchPostRequest

  return {
    updateProject
  }
}

function getUpdateProjectMutation(projectId, projectName) {
  return `mutation Mutation {
    editProject(
      projectId: "${projectId}",
      projectName: "${projectName}"
    ) {
      id
    }
  }`
}

async function updateProject(projectId, projectName) {
  const response = await fetchData(getUpdateProjectMutation(projectId, projectName))

  const json = await response.json()
  const { data, error } = getDataOrError(json)

  if (error) {
    const dataNotFound = error === "Failed to update project"
    const message = dataNotFound
      ? `Failed to update project '${projectName}'.`
      : error

    alert(message)

    return
  }

  const isNotSuccess = !data
  if (isNotSuccess) {
    alert("Something went wrong. If the message perssits, kindly contact Authsio.com")
    return
  }

  alert(`Successfully updated project ${projectName}. Redirecting you to your dashboard.`);

  const { id: returnedId } = data
  return returnedId
}

function getDataOrError(json) {
  const hasErrors = !!json.errors
  if (hasErrors) {
    const firstError = json.errors[0].extensions.exception.errors[0].message
    return { error: firstError }
  }

  return { data: json.data.editProject }
}


