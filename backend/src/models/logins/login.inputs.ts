import { Field, InputType } from "type-graphql";

@InputType()
export class LoginInput {
  @Field()
  userName!: string;

  @Field()
  password!: string;
}
