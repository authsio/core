import {
  BelongsTo,
  Column,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  DataType,
  Table,
} from "sequelize-typescript";
import { Field, ID, ObjectType } from "type-graphql";
import { User } from "../users/user.type";

@ObjectType()
@Table({
  paranoid: true,
  timestamps: true,
})
export class Login extends Model {
  @Field(() => ID)
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUIDV4)
  public id!: string;

  @Field(() => String)
  @Column(DataType.STRING)
  public userName!: string;

  @Column(DataType.STRING)
  public passwordSalt!: string;

  @Column(DataType.STRING)
  public passwordHash!: string;

  @ForeignKey(() => User)
  @Column(DataType.STRING)
  public userId!: string;

  @Field(() => User)
  @BelongsTo(() => User)
  public userInfo!: User;
}

@ObjectType()
export class Token {
  @Field(() => String, { nullable: true })
  public token!: string | null;

  @Field(() => String)
  public message!: string;
}
