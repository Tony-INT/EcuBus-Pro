import { assign, cloneDeep } from 'lodash'
import { Sequence, ServiceItem } from './share/uds'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import workerpool, { Pool } from 'workerpool'
import { UdsLOG } from './log'
import { TesterInfo } from './share/tester'
import { CanMessage, formatError } from './share/can'
import { ServiceId } from './share/service'
type HandlerMap = {
  sendCanFrame: (pool: UdsTester, data: CanMessage) => Promise<number>
  sendDiag: (pool: UdsTester, data: {
    device?: string
    address?: string
    service: ServiceItem
    isReq: boolean
  }) => Promise<number>
};

type EventHandlerMap = {
  [K in keyof HandlerMap]: HandlerMap[K];
};



export default class UdsTester {
  pool: Pool
  worker: any
  selfStop = false
  log: UdsLOG
  serviceMap: Record<string, ServiceItem> = {}
  ts = 0
  eventHandlerMap: Partial<EventHandlerMap> = {}
  constructor(
    env: {
      PROJECT_ROOT:string,
      PROJECT_NAME:string,
      MODE:'node'|'sequence',
      NAME:string
    },
    jsFilePath: string,
    log: UdsLOG,
    private tester?: TesterInfo,
  ) {
    if (tester) {
      for (const [_name, serviceList] of Object.entries(tester.allServiceList)) {
        for (const service of serviceList) {
          this.serviceMap[`${tester.name}.${service.name}`] = service
        }
      }
    }

    this.log = log
    this.pool = workerpool.pool(jsFilePath, {
      minWorkers: 1,
      maxWorkers: 1,
      workerType: 'thread',
      emitStdStreams: false,
      workerThreadOpts: {
        stderr: true,
        stdout: true,
        env: env,
        execArgv:['--enable-source-maps']
      },

      onTerminateWorker: () => {
        if (!this.selfStop) {

          this.log.systemMsg('worker terminated', this.ts, 'error')
        }
      },

    })
    const d = (this.pool as any)._getWorker()
    this.worker = d

    d.worker.stdout.on('data', (data: any) => {
      if (!this.selfStop) {
        const str = data.toString().trim()
        this.log.scriptMsg(str, this.ts)
      }
    })
    d.worker.stderr.on('data', (data: any) => {
      if (!this.selfStop) {
        const str = data.toString().trim()
        this.log.systemMsg(str, this.ts, 'error')
      }
    })
  }
  updateTs(ts: number) {
    this.ts = ts
  }
  private async workerEmit(method: string, data: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.pool
        .exec('__on', [method, data], {
          on: (payload: any) => {
            this.eventHandler(payload, resolve, reject)
          }
        })
        .then(resolve)
        .catch(reject)
    })
  }
  eventHandler(payload: any, resolve: any, reject: any) {
    const id = payload.id
    const event = payload.event
    const data = payload.data

    if (event == 'set' && this.tester) {
      const service = data.service as ServiceItem
      const isReq= data.isRequest as boolean
      const name = this.tester.name
      if (this.serviceMap[`${name}.${service.name}`]) {
        if(isReq){
          service.params = service.params.map((p: any) => {
            p.value = Buffer.from(p.value)
            return p
          })
        }else{
          service.respParams = service.respParams.map((p: any) => {
            p.value = Buffer.from(p.value)
            return p
          })
        }
        assign(this.serviceMap[`${name}.${service.name}`], service)
      }
      this.worker.exec('__eventDone', [id]).catch(reject)
    } else {
      const eventKey = event as keyof EventHandlerMap
      const handler = this.eventHandlerMap[eventKey]
      if (handler) {
        const result = handler(this, data)
        if (result instanceof Promise) {
          result.then((e) => {
            this.worker.exec('__eventDone', [id, {
              data: e
            }]).catch((e: any) => {
              this.worker.exec('__eventDone', [id, {
                err: e.toString()
              }]).catch(reject)
            })
          }).catch((e) => {
            console.log('crash',e)
            this.worker.exec('__eventDone', [id, {
              err: e.toString()
            }]).catch(reject)
          })

        } else {

          this.worker.exec('__eventDone', [id,{
            data: result
          }]).catch(reject)
        }
      } else {
        this.worker.exec('__eventDone', [id,{
          err: 'no handler found'
        }]).catch(reject)
      }
    }

  }
  registerHandler<T extends keyof HandlerMap>(id: T, handler: HandlerMap[T]): void {
    this.eventHandlerMap[id] = handler
  }
  // async triggerPreSend(serviceName: string) {
  //   if (this.tester) {
  //     await this.workerEmit(`${this.tester.name}.${serviceName}.preSend`, `${this.tester.name}.${serviceName}`)
  //   }

  // }
  async triggerSend(service: ServiceItem, ts: number) {
    this.updateTs(ts)
    if (this.tester) {
      try{
        await this.workerEmit(`${this.tester.name}.${service.name}.send`, service)
      }catch(e:any){
         throw formatError(e)
      }
    }
  }
  async triggerRecv(service: ServiceItem, ts: number) {
    this.updateTs(ts)
    if (this.tester) {
      try{
        await this.workerEmit(`${this.tester.name}.${service.name}.recv`, service)
      }catch(e:any){
         throw  formatError(e)
      }
    }
  }
  async triggerCanFrame(msg: CanMessage) {
    try{
      const r=await this.workerEmit('__canMsg', msg)
      return r
    }catch(e:any){
      throw formatError(e)
    }
  }
  async start(projectPath: string) {

    await this.pool.exec('__start', [this.tester?.name, this.serviceMap, projectPath])
    await this.workerEmit('__varFc', null)
  }

  async exec(name: string, method: string, param: any[]): Promise<ServiceItem[]> {
    return new Promise((resolve, reject) => {
      if (Object.keys(this.worker.processing).length > 0) {
        reject(new Error(`function ${method} not finished, async function need call with await`))
        return
      }
      this.pool
        .exec(`${name}.${method}`, param, {
          on: (payload: any) => {
            this.eventHandler(payload, resolve, reject)
          }
        })
        .then((value: any) => {
          resolve(value)
        })
        .catch((e:any) => {
          reject(formatError(e))
        })
    })
  }
  stop() {
    this.selfStop = true
    this.pool.terminate(true).catch(null)
  }
}