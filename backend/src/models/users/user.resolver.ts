import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Context } from "../..";
import { BootstrapNewAccountInput } from "./user.input";
import { User } from "./user.type";

const doNotTouchSchemas = [
  "pg_toast",
  "pg_catalog",
  "public",
  "information_schema",
];

@Resolver(() => User)
export class UserResolver {
  @Mutation(() => Boolean, {
    description:
      "This can only be used to bootstrap the project and reject calls after the initial setup",
  })
  async bootstrap(
    @Arg("data") _input: BootstrapNewAccountInput,
    @Ctx() { sequelize }: Context
  ): Promise<boolean> {
    const [results, metadata] = (await sequelize.query(
      "SELECT schema_name FROM information_schema.schemata"
    )) as [{ schema_name: string }[], any];
    // Filter postgres and public out
    const touchableSchemas = results.filter(
      (i) => !doNotTouchSchemas.includes(i.schema_name)
    );
    if (touchableSchemas.length) {
      return false;
    }
    // NOW WE HAVE ENSURED THAT NO OTHER SCHEMA ARE OUT THERE
    // THIS MEANS WE CAN BOOTSTRAP A NEW PROJECT
    return false;
  }
}
