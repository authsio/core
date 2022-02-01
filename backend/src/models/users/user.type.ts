import {
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  HasOne,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { Field, Float, ID, ObjectType } from "type-graphql";
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
  @Column(DataType.STRING)
  public email!: string;

  @Field(() => Login, { nullable: true })
  @HasOne(() => Login)
  public login!: Login;

  @Field(() => Project, { nullable: true })
  @HasMany(() => Project)
  public projects!: Project;
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

@ObjectType()
class UserPayments {
  @Field(() => ID)
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  public userId!: string;

  @Field(() => String)
  @Column(DataType.STRING)
  public planName!: string;

  @Field(() => Float)
  @Column(DataType.FLOAT)
  public planPrice!: number;

  @Field(() => Number)
  @Column(DataType.NUMBER)
  public planProjectLimit!: number;

  @Field(() => Date)
  @Column(DataType.DATE)
  public renewalDate!: Date;

  @Field(() => String)
  @Column(DataType.STRING)
  public stripeId!: string;
}
