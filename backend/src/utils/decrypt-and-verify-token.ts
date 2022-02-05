import jwt, { JwtPayload } from "jsonwebtoken";
import { Sequelize } from "sequelize-typescript";
import { Key } from "../models/keys/key.type";
import { Project } from "../models/projects/project.type";

export async function decryptAndVerifyToken(
  headers: {
    // THIS IS THE USER's USER AUTH
    authorization?: string;
    // THIS IS THE PUBLIC | PRIVATE KEY IN THE KEY TABLE
    "x-api-key"?: string;
  },
  db: Sequelize
): Promise<null | JwtPayload> {
  if (!headers?.authorization || !headers["x-api-key"]) {
    return null;
  }
  let key = headers["x-api-key"];
  const rawToken = headers.authorization.split(" ")[1];
  if (!rawToken) {
    return { key };
  }
  const decoded = jwt.decode(rawToken) as JwtPayload;
  if (!decoded) {
    return { key };
  }
  const foundKey = (await db.models.Key.findOne({
    where: {
      key,
    },
  })) as Key;
  if (foundKey && decoded.projectId) {
    if (foundKey.projectId !== decoded.projectId) {
      throw new Error("Dont be sneaky");
    }
  }
  // This might not be correct, bc we might be on the wrong schema here
  // We might need to use the projectId as the schema also
  // db.models.Project.schema(payload.projectId).findOne
  // Might be able to use the key here to lookup the project schema???
  const project = (await db.models.Project.schema(
    foundKey?.projectId ?? decoded?.projectId
  ).findOne({
    where: {
      projectId: foundKey?.projectId ?? decoded?.projectId,
    },
  })) as Project;
  if (!project) {
    return { key };
  }
  try {
    // Take the project signing secret to verify the token
    const token = jwt.verify(rawToken, project.jwtSigningSecret);
    return token
      ? { key, token, signingKey: project.jwtSigningSecret }
      : { key };
  } catch (error) {
    throw new Error(`Error with token: ${error}`);
  }
}
