import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Test {
  @Field(() => String)
  public test!: string;
}
