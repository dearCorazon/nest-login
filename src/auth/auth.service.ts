import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username, pass) {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      this.usersService.errorOneTime(user.userId)
      const errorMessage = this.usersService.getErrorMessage(user.userId)
      console.log(errorMessage);
      throw new UnauthorizedException({error:errorMessage});
    }
    const payload = { sub: user.userId, username: user.username };
    this.usersService.refreshState(user.userId)
    this.usersService.refreshState(0)
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
