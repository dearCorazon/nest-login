import { Injectable } from '@nestjs/common';
import  *  as svgCaptcha from  'svg-captcha'

@Injectable()
export class ToolService {
    captche() {
        return svgCaptcha.create()
    }
}
