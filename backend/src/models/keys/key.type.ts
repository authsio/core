import {
  Column,
  DataType,
  Default,
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
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Field()
  public key!: string;

  @Field(() => KEY_TYPE)
  @Column(DataType.ENUM(...Object.values(KEY_TYPE)))
  public keyType!: KEY_TYPE;

  // NOTE: This is really the schema where we want to do the lookup
  @Column(DataType.UUID)
  public projectId!: string;
}
