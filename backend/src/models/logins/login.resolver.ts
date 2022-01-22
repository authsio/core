import { Query, Resolver } from "type-graphql";
import { Login, Token } from "./login.type";

@Resolver(() => Login)
export class LoginResolver {
  @Query(() => Token)
  async login(): Promise<Token> {
    return {
      token: null,
      message: "IN PROGRESS",
    };
  }
}
