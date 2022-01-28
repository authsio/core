import {
  Column,
  DataType,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { Field, ID, ObjectType } from "type-graphql";
import { KEY_TYPE } from "../enums/key-types";
import { Project } from "../projects/project.type";

// NOTE: This will be the only table in the public schema
@ObjectType()
@Table({
  paranoid: true,
  timestamps: true,
})
export class Key extends Model {
  @Field(() => ID)
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUIDV4)
  public id!: string;

  @Field(() => KEY_TYPE)
  @Column(DataType.ENUM(...Object.values(KEY_TYPE)))
  public keyType!: KEY_TYPE;

  // NOTE: This is really the schema where we want to do the lookup
  @ForeignKey(() => Project)
  @Column(DataType.STRING)
  public projectId!: string;
}
