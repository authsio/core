import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { Field, ID, ObjectType } from "type-graphql";
import { Key } from "../keys/key.type";
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

  // This could be a public key, or something else,
  // But the goal with this is that every project will have its own signing secret
  // This is key for security across projects and users to verify tokens
  @Column
  public jwtSigningSecret!: string;

  @ForeignKey(() => User)
  @Column(DataType.STRING)
  public userId!: string;

  @Field(() => User)
  @BelongsTo(() => User)
  public userInfo!: User;

  @Field(() => Key, { nullable: true })
  @HasMany(() => Key)
  public keys!: Key;
}
