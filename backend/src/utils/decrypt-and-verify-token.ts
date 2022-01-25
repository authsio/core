import jwt, { JwtPayload } from "jsonwebtoken";
import { Sequelize } from "sequelize-typescript";
import { Project } from "../models/projects/project.type";

export async function decryptAndVerifyToken(
  headers: {
    authorization?: string;
  },
  db: Sequelize
): Promise<string | null | JwtPayload> {
  if (!headers?.authorization) {
    return null;
  }
  const rawToken = headers.authorization.split(" ")[1];
  if (!rawToken) {
    throw new Error("Please use standard Bearer token format");
  }
  const decoded = jwt.decode(rawToken);
  if (!decoded || decoded === typeof "string") {
    throw new Error("Please use standard Bearer token format for decode");
  }
  const { payload } = decoded as JwtPayload;
  // This might not be correct, bc we might be on the wrong schema here
  // We might need to use the projectId as the schema also
  // db.models.Project.schema(payload.projectId).findOne
  // TODO: Flush this out
  const project = (await db.models.Project.findOne({
    where: {
      id: payload.projectId,
    },
  })) as Project;
  if (!project) {
    throw new Error("Can not find user project");
  }
  try {
    // Take the project signing secret to verify the token
    const token = jwt.verify(rawToken, project.jwtSigningSecret);
    return token ? token : null;
  } catch (error) {
    throw new Error(`Error with token: ${error}`);
  }
}
