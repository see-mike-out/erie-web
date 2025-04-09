// Roles
export const RoleAnnounceKeyScStopPlay = "stop-play-keyboard-shortcut",
  RoleCardinality = "cardinality",
  RoleStreamName = 'stream.name',
  RoleStreamScaleOverview = 'stream.scale.overview',
  RoleStreamScaleDescription = 'stream.scale.description',
  RoleStreamOverlayLength = 'stream.overlay.length',
  RoleStreamSound = 'stream.sound',
  RoleAnnounceFinished = 'finished',
  RoleAnnounceStarting = 'starting';


export const OrderingRoles = [
  RoleAnnounceKeyScStopPlay,
  RoleCardinality,
  RoleStreamName,
  RoleStreamScaleOverview,
  RoleStreamScaleDescription,
  RoleStreamOverlayLength,
  RoleStreamSound,
  RoleAnnounceFinished,
  RoleAnnounceStarting
];

export type OrderingRole = typeof OrderingRoles[number];

// Order Item Types
export const OrderingTypeMarkup = "markup",
  OrderingTypeText = "text",
  OrderingTypeSound = "sound";