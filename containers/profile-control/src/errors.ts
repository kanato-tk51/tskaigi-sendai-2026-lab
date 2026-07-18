import type { ProfileErrorCode } from "./constants.js";

export class ProfileControlError extends Error {
  readonly code: ProfileErrorCode;

  constructor(code: ProfileErrorCode) {
    super(code);
    this.name = "ProfileControlError";
    this.code = code;
  }
}

export function failProfile(code: ProfileErrorCode): never {
  throw new ProfileControlError(code);
}
