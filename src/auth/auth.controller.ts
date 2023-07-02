import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  Session,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ToolService } from '../tool/tool.service'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private toolService: ToolService) { }
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('authCode')
  async getCode(@Req() req, @Res() res) {
    const captcha = await this.toolService.captche()
    req.session.code = captcha.text
    res.type('image/svg+xml');
    res.status(HttpStatus.OK).send(captcha.data)
  }

  @Post('verifyCode') 
  async verifyCode(@Body() signInDto: Record<string, any>, @Session() session) {
    
    const { code } = signInDto
    const { code2 } = session 
    console.log(session);
    console.log(`bodycode:${code}`, `session code:${code2}`);

    if (code && code2) {
      if (code.toUppperCase() === code2.toUppperCase()) {
        console.log('pass');
      } else { 
        console.log('验证码错误');
        throw new UnauthorizedException({
          err: '验证码错误' 
        });
      }
    }
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: Record<string, any>, @Session() session) {
    console.log(`login`);
    console.log(session);
    console.log(session.code);
    const code = JSON.stringify(signInDto.code)
    const code2 = JSON.stringify(session.code)
    console.log(`body code:${code},session code:${code2}`);
    if (code && code2) {
      if (code.toUpperCase() === code2.toUpperCase()) {
        console.log('pass');
      } else {
        console.log('验证码错误');
        throw new UnauthorizedException({ 
          err: '验证码错误'
        });
      }
    }
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

}