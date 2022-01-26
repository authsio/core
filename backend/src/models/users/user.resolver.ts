import { Mutation, Resolver } from "type-graphql";
import { User } from "./user.type";

@Resolver(() => User)
export class UserResolver {
  @Mutation(() => Boolean, {
    description:
      "This can only be used to bootstrap the project and reject calls after the initial setup",
  })
  async bootstrap(): Promise<boolean> {
    return false;
  }
}
