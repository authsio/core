import { Query, Resolver } from "type-graphql";
import { Test } from "./test.type";

@Resolver(() => Test)
export class TestResolver {
  @Query(() => Test)
  async getTest(): Promise<Test> {
    return {
      test: "yes",
    };
  }
}
