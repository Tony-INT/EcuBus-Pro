import { BrowserWindow, ipcMain, shell } from 'electron'
import scriptIndex from '../../../resources/docs/scriptApi/index.html?asset&asarUnpack'
// #v-ifdef IGNORE_NODE!='1'
import { PEAK_TP } from '../docan/peak'
import { ZLG_CAN } from '../docan/zlg'
import { KVASER_CAN } from '../docan/kvaser'
import { SIMULATE_CAN } from '../docan/simulate'
// #v-endif
import dllLib from '../../../resources/lib/zlgcan.dll?asset&asarUnpack'
import esbuildWin from '../../../resources/bin/esbuild.exe?asset&asarUnpack'
import path from 'path'
import { compileTsc, createProject, deleteNode, deleteTester, findService, getBuildStatus, refreshProject, UDSTesterMain } from '../docan/uds'
import { CAN_ID_TYPE, CAN_SOCKET, CanBase, CanInterAction, CanNode, formatError, swapAddr } from '../share/can'
import { CAN_TP, TpError } from '../docan/cantp'
import { UdsDevice } from '../share/uds'
import { TesterInfo } from '../share/tester'
import log from 'electron-log'
import { NodeItem } from '../docan/nodeItem'
import { UdsLOG } from '../log'
import {getEthDevices} from './../doip'


const libPath = path.dirname(dllLib)
log.info('dll lib path:', libPath)
// #v-ifdef IGNORE_NODE!='1'
PEAK_TP.loadDllPath(libPath)
ZLG_CAN.loadDllPath(libPath)
KVASER_CAN.loadDllPath(libPath)
// #v-endif




ipcMain.on('ipc-open-script-api', (event, arg) => {
    shell.openPath(scriptIndex)
})


ipcMain.handle('ipc-get-build-status', async (event, ...arg) => {
    const projectPath = arg[0] as string
    const projectName = arg[1] as string
    const testerScript = arg[2] as string
    return await getBuildStatus(projectPath, projectName, testerScript)
})

ipcMain.handle('ipc-create-project', async (event, ...arg) => {
    const projectPath = arg[0] as string
    const projectName = arg[1] as string
    const testers = arg[2]
    const nodes = arg[3]
    await createProject(projectPath, projectName, testers, nodes, 'ECB')
    await refreshProject(projectPath, projectName, testers, 'ECB')
    await shell.openPath(path.join(projectPath, `${projectName}.code-workspace`))
})

ipcMain.handle('ipc-build-project', async (event, ...arg) => {
    const projectPath = arg[0] as string
    const projectName = arg[1] as string
    const testers = arg[2]
    const nodes = arg[3]
    const entry = arg[4] as string

    const result = await compileTsc(projectPath, projectName, testers, nodes, entry, esbuildWin, path.join(libPath, 'js'), 'ECB')
    if (result.length > 0) {
        for (const err of result) {
            sysLog.error(`${err.file}:${err.line} build error: ${err.message}`)
        }
    }
    return result
})

ipcMain.handle('ipc-delete-node', async (event, ...arg) => {
    const projectPath = arg[0] as string
    const projectName = arg[1] as string
    const node = arg[2]
    // return await deleteNode(projectPath, projectName, node)
})
ipcMain.handle('ipc-delete-tester', async (event, ...arg) => {
    const projectPath = arg[0] as string
    const projectName = arg[1] as string
    const node = arg[2]
    // return await deleteTester(projectPath, projectName, node)
})

export function getCanVersion(vendor: string) {
    // #v-ifdef IGNORE_NODE!='1'
    vendor = vendor.toUpperCase()
    if (vendor === 'PEAK') {
        return PEAK_TP.getLibVersion()
    } else if (vendor === 'ZLG') {
        return ZLG_CAN.getLibVersion()
    } else if (vendor === 'KVASER') {
        return KVASER_CAN.getLibVersion()
    } else if (vendor === 'SIMULATE') {
        return SIMULATE_CAN.getLibVersion()
    }
    else
    // #v-endif
    {
        return 'unknown'
    }

}

function getCanDevices(vendor: string) {
    vendor = vendor.toUpperCase()
    // #v-ifdef IGNORE_NODE!='1'
    if (vendor === 'PEAK') {
        return PEAK_TP.getValidDevices()
    } else if (vendor === 'ZLG') {
        return ZLG_CAN.getValidDevices()
    } else if (vendor === 'KVASER') {
        return KVASER_CAN.getValidDevices()
    } else if (vendor === 'SIMULATE') {
        return SIMULATE_CAN.getValidDevices()
    }
    else
    // #v-endif
    {
        return []
    }
}

ipcMain.handle('ipc-get-can-devices', async (event, ...arg) => {
    return getCanDevices(arg[0])
})

ipcMain.handle('ipc-get-eth-devices', async (event, ...arg) => {
    const vendor = arg[0].toUpperCase()
    if(vendor=='SIMULATE'){
        return getEthDevices()
    }
    return []
    
})





interface Subscription {
    owner: string;
    name: string;
    displayName: string;
    createdTime: string;
    description: string;
    user: string;
    pricing: string;
    plan: string;
    payment: string;
    startTime: string;
    endTime: string;
    period: string;
    state: string;
}


const canBaseMap = new Map<string, CanBase>()
const udsTesterMap = new Map<string, UDSTesterMain>()
const nodeMap = new Map<string, NodeItem>()
let cantps: CAN_TP[] = []

ipcMain.handle('ipc-global-start', async (event, ...arg) => {
    let i = 0
    const projectInfo = arg[i++] as {
        path: string,
        name: string
    }
    const devices = arg[i++] as Record<string, UdsDevice>
    const testers = arg[i++] as Record<string, TesterInfo>
    const nodes = arg[i++] as Record<string, CanNode>
    const sub = arg[i++] as Subscription[] || []

    
    let activeKey = ''
    try {
        for (const key in devices) {
            const device = devices[key]
            if (device.type == 'can' && device.canDevice) {
                const canDevice = device.canDevice
                let canBase: CanBase | undefined
                activeKey = canDevice.name
                // #v-ifdef IGNORE_NODE!='1'
                if (canDevice.vendor == 'peak') {
                    canBase = new PEAK_TP(canDevice)
                } else if (canDevice.vendor == 'zlg') {
                    canBase = new ZLG_CAN(canDevice)
                } else if (canDevice.vendor == 'kvaser') {
                    canBase = new KVASER_CAN(canDevice)
                } else if (canDevice.vendor == 'simulate') {
                    canBase = new SIMULATE_CAN(canDevice)
                }
                sysLog.info(`start can device ${canDevice.vendor}-${canDevice.handle} success`)
                // #v-endif
                if (canBase) {
                    canBase.event.on('close', (errMsg) => {
                        if (errMsg) {
                            sysLog.error(`${canDevice.vendor}-${canDevice.handle} error: ${errMsg}`)
                            globalStop(true)
                        }
                    })
                    canBaseMap.set(key, canBase)
                }
            }
        }
    } catch (err: any) {
        sysLog.error(`${activeKey} - ${err.toString()}`)
        throw err
    }
    //nodes
    for (const key in nodes) {
        const node = nodes[key]
        const nodeItem = new NodeItem(node, canBaseMap, projectInfo.path, projectInfo.name, testers)
        try {
            await nodeItem.start()
            nodeMap.set(key, nodeItem)
        } catch (err: any) {
            nodeItem.log?.systemMsg(formatError(err), 0, 'error')
            nodeItem.close()

        }

    }
    //testes
    for (const key in testers) {
        const tester = testers[key]
        if (tester.type == 'can') {
            for (const val of canBaseMap.values()) {
                const cantp = new CAN_TP(val,true)
                for (const addr of tester.address) {
                    if (addr.type == 'can' && addr.canAddr) {
                        const id = cantp.getReadId(addr.canAddr)
                        cantp.event.on(id, (data) => {
                            if (!(data instanceof TpError)) {
                                const log = new UdsLOG(tester.name, tester.id)
                                const item = findService(tester, data.data, true)
                                if (item) {
                                    log.sent(item, data.ts, data.data)
                                }

                                log.close()

                            }
                        })
                        const idR = cantp.getReadId(swapAddr(addr.canAddr))
                        cantp.event.on(idR, (data) => {
                            if (!(data instanceof TpError)) {
                                const log = new UdsLOG(tester.name, tester.id)
                                const item = findService(tester, data.data, false)
                                if (item) {
                                    log.recv(item, data.ts, data.data)
                                }
                                log.close()

                            }
                        })

                    }
                }
                if (cantp.rxBaseHandleExist.size > 0) {
                    cantps.push(cantp)
                }
            }
        }
    }

})
interface timerType {
    timer: NodeJS.Timeout,
    socket: CAN_SOCKET
}
const timerMap = new Map<string, timerType>()


export function globalStop(emit = false) {
    //clear all timer
    timerMap.forEach((value) => {
        clearInterval(value.timer)
        value.socket.close()
    })
    canBaseMap.forEach((value) => {
        value.close()
        sysLog.info(`stop can device ${value.info.vendor}-${value.info.handle}`)
    })
    canBaseMap.clear()

    nodeMap.forEach((value) => {
        value.close()
    })
    nodeMap.clear()
    cantps.forEach((value) => {
        value.close()
    })
    cantps = []
    if (emit) {
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('ipc-global-stop')
        })
    }
}

ipcMain.handle('ipc-global-stop', async (event, ...arg) => {
    globalStop()
})








ipcMain.handle('ipc-run-sequence', async (event, ...arg) => {
    const projectPath = arg[0] as string
    const projectName = arg[1] as string
    const tester = arg[2] as TesterInfo
    const device = arg[3] as UdsDevice
    const seqIndex = arg[4] as number
    const cycle = arg[5] as number
    try {

        const uds = new UDSTesterMain({
            projectPath,
            projectName,
        }, tester, device)
        if (device.type == 'can' && device.canDevice) {
            const canBase = canBaseMap.get(device.canDevice.id)
            if (canBase) {
                uds.setCanBase(canBaseMap.get(device.canDevice.id))
                udsTesterMap.set(tester.id, uds)
                await uds.runSequence(seqIndex, cycle)
            } else {
                throw new Error(`can device ${device.canDevice.vendor}-${device.canDevice.handle} not found`)
            }
        }
    } catch (err: any) {

        sysLog.error(`Sequence ${tester.name} ` + err.toString())

        throw err
    }

})

ipcMain.handle('ipc-stop-sequence', async (event, ...arg) => {
    const id = arg[0] as string
    const uds = udsTesterMap.get(id)

    if (uds) {
        uds.cancel()
    }
})

function getLenByDlc(dlc: number, canFd: boolean) {
    const map: Record<number, number> = {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 8,
        10: 8,
        11: 8,
        12: 8,
        13: 8,
        14: 8,
        15: 8
    }
    const mapFd: Record<number, number> = {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 12,
        10: 16,
        11: 20,
        12: 24,
        13: 32,
        14: 48,
        15: 64
    }
    if (canFd) {
        return mapFd[dlc] || 0
    } else {
        return map[dlc] || 0
    }
}
ipcMain.on('ipc-send-can', (event, ...arg) => {
    const ia = arg[0] as CanInterAction

    const canBase = canBaseMap.get(ia.channel)
    if (canBase) {
        const fd = ia.type.includes('fd')
        const len = getLenByDlc(ia.dlc, fd)
        if (fd) {
            if (canBase.info.canfd == false) {
                sysLog.error(`can device ${canBase.info.vendor}-${canBase.info.handle} not enable canfd`)
                return
            }
        }


        const socket = new CAN_SOCKET(canBase, parseInt(ia.id, 16), {
            idType: ia.type.includes('e') ? CAN_ID_TYPE.EXTENDED : CAN_ID_TYPE.STANDARD,
            brs: ia.brs || false,
            canfd: fd,
            remote: ia.remote || false

        })
        const b = Buffer.alloc(len)
        const d = Buffer.from(ia.data.join(''), 'hex')
        //copy d to b
        d.copy(b)
        socket.write(b).catch(null).finally(() => {
            socket.close()
        })

    } else {
        sysLog.error(`can device not found`)
    }
})

ipcMain.on('ipc-send-can-period', (event, ...arg) => {
    const id = arg[0] as string
    const ia = arg[1] as CanInterAction

    const canBase = canBaseMap.get(ia.channel)
    if (canBase) {
        const fd = ia.type.includes('fd')

        const len = getLenByDlc(ia.dlc, fd)
        const socket = new CAN_SOCKET(canBase, parseInt(ia.id, 16), {
            idType: ia.type.includes('e') ? CAN_ID_TYPE.EXTENDED : CAN_ID_TYPE.STANDARD,
            brs: ia.brs || false,
            canfd: fd,
            remote: ia.remote || false

        })
        const b = Buffer.alloc(len)
        const d = Buffer.from(ia.data.join(''), 'hex')
        //copy d to b
        d.copy(b)
        //if timer exist, clear it
        const timer = timerMap.get(id)
        if (timer) {
            clearInterval(timer.timer)
            timer.socket.close()
        }
        //create new timer
        const t = setInterval(() => {
            if (fd) {
                if (canBase.info.canfd == false) {
                    sysLog.error(`can device ${canBase.info.vendor}-${canBase.info.handle} not enable canfd`)
                    return
                }
            }
            socket.write(b).catch(null)
        }, ia.trigger.period || 10)
        timerMap.set(id, {
            timer: t,
            socket: socket
        })

    } else {
        sysLog.error(`can device not found`)
    }
})
ipcMain.on('ipc-stop-can-period', (event, ...arg) => {
    const id = arg[0] as string
    const timer = timerMap.get(id)
    if (timer) {
        clearInterval(timer.timer)
        timer.socket.close()
    }
})