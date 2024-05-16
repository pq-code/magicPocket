
//查看本地IP地址
export const getLocalIP = () => {
  const os = require('os');
  const osType = os.type(); //系统类型
  const ifaces: any = os.networkInterfaces(); //网络信息
  let locatIpIpv4: any = '';
  let locatIpIpv6: any = [];
  console.log('系统类型', osType)
  try {
    for (let dev in ifaces) {
      if (dev === '本地连接' || dev === 'WLAN' || dev == 'en0') {
        for (let j = 0; j < ifaces[dev].length; j++) {
          if (ifaces[dev][j].family === 'IPv4') {
            locatIpIpv4 = ifaces[dev][j].address;
          }
          if (ifaces[dev][j].family === 'IPv6' && ifaces[dev][j].address.substring(0, 6) !== 'fe80::') {
            locatIpIpv6.push(ifaces[dev][j]);
          }
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
  return { locatIpIpv4, locatIpIpv6 };
}
