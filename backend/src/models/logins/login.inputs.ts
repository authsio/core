import { IsEmail } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class LoginInput {
  @IsEmail()
  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  publicKey!: string;
}
