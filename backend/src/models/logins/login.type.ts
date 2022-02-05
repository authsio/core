import {
  BelongsTo,
  Column,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  DataType,
  Table,
  Default,
  BeforeCreate,
  BeforeBulkCreate,
  BeforeUpdate,
  BeforeUpsert,
} from "sequelize-typescript";
import { Field, ID, ObjectType } from "type-graphql";
import { doesPasswordMatch } from "../../utils/does-password-match";
import { hashNewPassword } from "../../utils/hash-new-password";
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
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Field(() => String)
  @Column(DataType.STRING)
  public email!: string;

  @Column(DataType.STRING)
  public passwordSalt!: string;

  @Column(DataType.STRING)
  public passwordHash!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  public userId!: string;

  @Field(() => User)
  @BelongsTo(() => User)
  public userInfo!: User;

  public passwordMatch(checkPassword: string) {
    // NO LOGGING
    return doesPasswordMatch(checkPassword, {
      passwordSalt: this.passwordSalt,
      passwordHash: this.passwordHash,
    });
  }

  // TAKE IN THE STRING OF USERS PASSWORD AND CREATE HASH AND SALT
  @BeforeCreate
  @BeforeBulkCreate
  @BeforeUpdate
  @BeforeUpsert
  static hashPassword(instance: Login) {
    // NO LOGGING
    if (instance.passwordHash) {
      const { hashedPassword, salt } = hashNewPassword(instance.passwordHash);
      instance.passwordHash = hashedPassword;
      instance.passwordSalt = salt;
    }
  }
}

@ObjectType()
export class Token {
  @Field(() => String, { nullable: true })
  public token!: string | null;

  @Field(() => String)
  public message!: string;
}
