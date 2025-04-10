import { HashedObject } from "../generic";

// Roles
export const RoleAnnounceKeyScStopPlay = "stop-play-keyboard-shortcut",
  RoleLength = 'length',
  RoleTitle = 'title',
  RoleDescription = 'description',
  RoleName = 'name',
  RoleScaleOverview = 'scale.overview',
  RoleScaleDescription = 'scale.description',
  RoleStreamSound = 'sound',
  RoleRepeatTitle = 'repeat.title';


export const OrderingRoles = [
  RoleAnnounceKeyScStopPlay,
  RoleStreamSound,
  RoleLength,
  RoleTitle,
  RoleDescription,
  RoleName,
  RoleScaleOverview,
  RoleScaleDescription,
  RoleStreamSound,
  RoleRepeatTitle
];

export type OrderingRole = typeof OrderingRoles[number];

// Order Item Types
export const OrderingTypeMarkup = "markup",
  OrderingTypeText = "text",
  OrderingTypeSound = "sound",
  OrderingTypeRepeat = "repeat";

export type OrderingMarkup = string | string[] | HashedObject<string>;