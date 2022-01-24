import { registerEnumType } from "type-graphql";

export enum KEY_TYPE {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

registerEnumType(KEY_TYPE, {
  name: "KEY_TYPE",
});
