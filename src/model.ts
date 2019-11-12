export class Athlete {
  constructor(
    readonly id: number,
    readonly username: string,
    // readonly resource_state: number,
    readonly firstname: string,
    readonly lastname: string,
    readonly city: string,
    readonly state: string,
    readonly country: string,
    readonly sex: string,
    readonly profileMedium: string,
    readonly profile: string,
  ) {}
}

export class LoginData {
  constructor(
    readonly accessToken: string, 
    readonly refreshToken: string,
    readonly expiresAt: Date,
    readonly athlete: Athlete,
  ) {}
}