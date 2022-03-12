import useRetrieveProjects from "./projects.retrive.js"
import useCreateProject from "./projects.create.js"
import useUpdateProject from "./projects.update.js"
import useDeleteProject from "./projects.delete.js"

export default function useProjects(authToken) {
  const { fetchProjects } = useRetrieveProjects(authToken)
  const { createProject } = useCreateProject(authToken)
  const { updateProject } = useUpdateProject(authToken)
  const { deleteProject } = useDeleteProject(authToken)

  return {
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}
