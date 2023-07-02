import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs'
// This should be a real class/interface representing a user entity
export type User = {
  userId: number,
  username:string,
  password: string,
  errorInfo: errorInfo
}
interface errorInfo {
  times: number,
  unlockTime :string,
  lock: boolean,
  hasError: boolean,
  lastErrorTime: string  
}


@Injectable()
export class UsersService {
  private readonly users :User[] = [
    {
      userId: 1,
      username: 'john',
      password: 'set',
      errorInfo:{
        lock:false,
        times:0 ,
        unlockTime: '',
        hasError:false,
        lastErrorTime:''
      }
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
      errorInfo: {
        lock:false,
        times: 0,
        unlockTime:'',
        hasError:false,
        lastErrorTime:''
      }
    },
    {
      userId: 0,
      username:'other',
      password: '',
      errorInfo: {
        lock:false,
        times: 0,
        unlockTime:'',
        hasError:false,
        lastErrorTime:''
      }
    }
  ];


  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username) || this.users.find(user => user.userId === 0);
  }
  private checkError(userId:number) {
    // 当发生错误，记一次时间，如果3分钟内错误次数超过3次

    const user =  this.users.find(user => user.userId === userId)
    const last = dayjs(user.errorInfo.lastErrorTime|| new Date())
    const now = dayjs(new Date())
    const diff = now.diff(last,'s')
    console.log(`距离上次出错${diff}秒`);
    if(diff < 180) {
      user.errorInfo.hasError =  true
      user.errorInfo.lastErrorTime = dayjs(new Date()).toISOString()
      user.errorInfo.times ++ 
    }
    else {
      user.errorInfo.times = 1
    }
    user.errorInfo.hasError = true

  }
  errorOneTime(userId:number) {
    const user =  this.users.find(user => user.userId === userId)
    this.checkError(user.userId)
    // if(user.errorInfo.)
    // 第一次错误： time++, hasError变为true
    // user.errorInfo.times++
    // 当times >= 3 生成解锁时间，lock为true
    const { times } = user.errorInfo
    if(times === 3) {
      const now = dayjs(new Date())
      user.errorInfo.lock = true
      user.errorInfo.unlockTime  = now.add(3,'minute').toISOString()      
    }
    console.log(user);
    
  }
  getErrorMessage(userId:number) {
    const user =  this.users.find(user => user.userId === userId)
    const { times, unlockTime } = user.errorInfo
    const message = {
      type:'',
      times: 0
    }
    if(times >= 1 && times < 3) {
      message.type =`用户名或密码错误`,
      message.times = 3 - times 
    }
    if(times >= 3 ) {
      const now = dayjs(new Date())
      const remainingTime = dayjs(unlockTime).diff(now,'s')
      message.type =`账户已锁定`,
      message.times = remainingTime
    }
    return message 

  }
  refreshState(userId:number) {
    const user =  this.users.find(user => user.userId === userId)
    user.errorInfo.hasError = true
    user.errorInfo.lock = false 
    user.errorInfo.times = 0
    user.errorInfo.unlockTime = ''
  }  
}
