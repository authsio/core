import { IsEmail } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class LoginInput {
  @IsEmail()
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class RegisterInput {
  @IsEmail()
  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field({ nullable: true })
  firstName!: string;

  @Field({ nullable: true })
  lastName!: string;
}
