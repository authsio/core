import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { Field, ID, ObjectType } from "type-graphql";
import { User } from "../users/user.type";

@ObjectType()
@Table({
  paranoid: true,
  timestamps: true,
})
export class Project extends Model {
  // The projectId will also be used as the schema name
  // Each project will have a new postgres schema
  // where we store the users of users
  @Field(() => ID)
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUIDV4)
  public id!: string;

  @Field(() => String)
  @Column(DataType.STRING)
  public name!: string;

  @ForeignKey(() => User)
  @Column(DataType.STRING)
  public userId!: string;

  @Field(() => User)
  @BelongsTo(() => User)
  public userInfo!: User;
}
