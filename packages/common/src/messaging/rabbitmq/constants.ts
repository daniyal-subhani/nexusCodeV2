export const EVENTS = {
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",

  USER_VERIFIED: "user.verified",

  MESSAGE_SENT: "message.sent",

  OTP_REQUESTED: "otp.requested",

  PASSWORD_RESET_REQUESTED:
    "password.reset.requested",
} as const;