# NXP Bootloader Example

* Interface: `CAN`
* Vendor Device: `PEAK`
* Test Board: [S32K344/324/314大开发板EVB评估板](https://item.taobao.com/item.htm?abbucket=19&id=740622398903&ns=1&pisk=foBIpV2TH20CwzFUG0Ew5MELoK95FawqR0tRmgHE2pppy1scPerutp56PNQ6Jvr3tQL5-pdlTU8ePLslllz43-ShxLvTury2-9WlzK0KvX3yXVKWtPrZ7-ShxUmIyo5T34GtHzkKwUQJBCKDALnpvBE6BnxXevd-pf39SFLJeUL-6VK2qYhpya39X3x223LK9ce9q3vJyap-wku64WtRAlu6g--gKeSp5xsGCHLstMTseY611BTA3FM-eOtdjWT25xNyksYegEbTQv95X3_6g6ajdasRm_d1F2EFkgQhCpvbakAf6152O1aKFFWeVIpJ10HRfdTGlTpYHVtG6M5RKwiSeHXF3QTD1uHkadB2MsQIqoj9p3QkiTzmKeIRmtf2hJgDA1IXCg-o3ENK9bi6iYt6ulZsZbX7XcDfljopZBKMv-r_fVGk9hxtlTrsOXRpjhP8flgLf&priceTId=213e363a17316432955378124eef04&skuId=5466402150063&spm=a21n57.1.item.3.3173523c0cLCx7&utparam=%7B%22aplus_abtest%22%3A%22b157c0e4b60c27af3bd36a542bb06f7a%22%7D&xxc=taobaoSearch), or NXP S32K344EVB.
  ![S32K344大开发板EVB评估板](doc/board.png)
* Ecu Code: [NXP Bootloader](https://community.nxp.com/t5/S32K-Knowledge-Base/Unified-bootloader-Demo/ta-p/1423099)

## Description

This example demonstrates how to use the EcuBus-Pro to upgrade Application firmware through UDS CAN protocol. This example use PEAK as USB-CAN adapter.

## CAN Configuration

* CAN
* Baudrate: 500Kbps
* TX ID: 0x784
* RX ID: 0x7f0

## Connection

| PEAK | S32K344大开发板EVB评估板 |
| ---- | ------------------------ |
| CANH | CAN0 H23-1               |
| CANL | CAN0 H23-2               |

## Usage

1. Download the [NXP Bootloader](https://community.nxp.com/t5/S32K-Knowledge-Base/Unified-bootloader-Demo/ta-p/1423099).  
   1. The download demo is based on old EcuBus tool, which is deprecated. The new EcuBus-Pro tool has more features and better performance.
2. If you use the `NXP S32K344EVB`, you can directly download the firmware. If you use the `S32K344大开发板EVB评估板`, you need to modify the LPUART pins and LED pins.
3. Connect the PEAK USB-CAN adapter to the computer, and connect the PEAK USB-CAN adapter to the S32K344 board.
4. Run the Sequence-Tester_1.  

---

**[详细指南&Demo视频](https://www.yuque.com/frankie-axwvu/mx7w4f/vmc8qg543f42xipt)**