import {
  Column,
  DataType,
  Default,
  HasMany,
  HasOne,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";
import { Field, ID, ObjectType } from "type-graphql";
import { Login } from "../logins/login.type";
import { Project } from "../projects/project.type";

@ObjectType()
@Table({
  paranoid: true,
  timestamps: true,
})
export class User extends Model {
  @Field(() => ID)
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Field(() => String)
  @Column(DataType.STRING)
  public firstName!: string;

  @Field(() => String)
  @Column(DataType.STRING)
  public lastName!: string;

  @Field(() => String)
  @Unique
  @Column(DataType.CITEXT)
  public email!: string;

  @Field(() => Login, { nullable: true })
  @HasOne(() => Login)
  public login!: Login;

  @Field(() => [Project], { nullable: true })
  @HasMany(() => Project)
  public projects!: Project[];
}

@ObjectType()
export class BootstrapProject {
  @Field({ nullable: true })
  publicKey!: string;

  @Field({ nullable: true })
  privateKey!: string;

  @Field({ nullable: true })
  projectId!: string;
}
