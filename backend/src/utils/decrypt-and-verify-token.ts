import jwt, { JwtPayload } from "jsonwebtoken";
import { Sequelize } from "sequelize-typescript";
import { Project } from "../models/projects/project.type";

export async function decryptAndVerifyToken(
  headers: {
    authorization?: string;
    "x-api-key"?: string;
  },
  db: Sequelize
): Promise<string | null | JwtPayload> {
  if (!headers?.authorization || !headers["x-api-key"]) {
    return null;
  }
  let key = headers["x-api-key"];
  const rawToken = headers.authorization.split(" ")[1];
  if (!rawToken) {
    return { key };
  }
  const decoded = jwt.decode(rawToken);
  if (!decoded || decoded === typeof "string") {
    return { key };
  }
  const { payload } = decoded as JwtPayload;
  // This might not be correct, bc we might be on the wrong schema here
  // We might need to use the projectId as the schema also
  // db.models.Project.schema(payload.projectId).findOne
  // Might be able to use the key here to lookup the project schema???
  const project = (await db.models.Project.findOne({
    where: {
      id: payload.projectId,
    },
  })) as Project;
  if (!project) {
    return { key };
  }
  try {
    // Take the project signing secret to verify the token
    const token = jwt.verify(rawToken, project.jwtSigningSecret);
    return token ? { key, token } : { key };
  } catch (error) {
    throw new Error(`Error with token: ${error}`);
  }
}
