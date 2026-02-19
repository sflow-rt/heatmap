// author: InMon Corp.
// version: 0.2
// date: 2/19/2026
// description: Heatmap flow animation
// copyright: Copyright (c) 2026 InMon Corp.

var options = {};

if(getSystemProperty('heatmap.update')) options.update = parseFloat(getSystemProperty('heatmap.update'));
if(getSystemProperty('heatmap.radius')) options.radius = parseFloat(getSystemProperty('heatmap.radius'));
if(getSystemProperty('heatmap.height')) options.height = getSystemProperty('heatmap.height');

var agents    = (getSystemProperty('heatmap.agents')   || 'ALL').toUpperCase();
var aggMode   = (getSystemProperty('heatmap.aggMode')  || 'max').toLowerCase();
var maxFlows  = getSystemProperty('heatmap.maxFlows')  || '1000';
var t         = getSystemProperty('heatmap.t')         || '2';
var n         = getSystemProperty('heatmap.n')         || '20';
var value     = getSystemProperty('heatmap.value')     || 'bytes';
var filter    = getSystemProperty('heatmap.filter')    || null;
var minIP     = getSystemProperty('heatmap.ip.start')  || '0.0.0.0';
var maxIP     = getSystemProperty('heatmap.ip.end')    || '255.255.255.255';
var ipLayer   = getSystemProperty('heatmap.ip.layer')  || '';
var inset     = Math.max(0, Math.min(0.2, getSystemProperty('heatmap.inset') || '0'));
var mode      = getSystemProperty('heatmap.mode')      || 'range';
var flow      = getSystemProperty('heatmap.topology.flow') || 'ip';
var refresh   = getSystemProperty('heatmap.topology.refresh') || 60000;

var flowKeys = {
  ip: 'ipsource,ipdestination',
  ip6: 'ip6source,ip6destination',
  mac: 'macsource,macdestination'
};

if(inset && 'range' == mode) options.axisInset = inset;

var keys = 'topology' == mode ? flowKeys[flow] || flowKeys['mac'] : `ipsource${ipLayer},ipdestination${ipLayer}`;
setFlow('heatmap',{keys:keys,value:value,filter:filter,n:n,t:t});

function ip2int(ip) {
  return ip.split('.').reduce(function(ipInt, octet) { return (ipInt<<8) + parseInt(octet, 10)}, 0) >>> 0;
}

var min = ip2int(minIP);
var max = ip2int(maxIP);
var range = max - min;
var maxVal = 2 ** 32 - 1;

function scaleValue(val) {
  if(val < min) return (val / min) * inset;
  if(val > max) return (1 - inset) + (((val - max) / (maxVal - max)) * inset);
  return ((val - min) / range) * (1 - (2 * inset)) + inset; 
}

var locations = {};
var nodeSet = {};
var nodeSetSize = 0;
function portValue(addr,now) {
  var location = locations[addr];
  if(!location || now > location.expires) {
    let result;
    switch(flow) {
      case 'ip':
        result = topologyLocateHostIP(addr);
        break;
      case 'ip6':
        result = topologyLocateHostIP6(addr);
        break;
      case 'mac':
        result = topologyLocateHostMac(addr);
        break;
      default:
        loc = [];
    }
    location = {result: result, expires: now + refresh};
    locations[addr] = location;
  }
  if(location.result.length == 0) {
    return -1;
  }
  var [{node:node,agent:agent,ifindex:ifindex}] = location.result;
  if(!(node || agent) || !ifindex) {
    return -1;
  }
  var nodeKey = node || agent;
  var nodeInfo = nodeSet[nodeKey];
  if(!nodeInfo) {
    nodeSetSize++;
    nodeInfo = {index: 0, referenced: now, ifindexSet:{}, ifindexSetSize: 0};
    nodeSet[nodeKey] = nodeInfo;
    if(node && nodeSet.hasOwnProperty(agent)) {
      nodeSetSize--;
      delete nodeSet[agent];
    }
    Object.keys(nodeSet).sort().forEach((el,index) => nodeSet[el].index = index);
  } else {
    nodeInfo.referenced = now;
  }
  if(!nodeInfo.ifindexSet.hasOwnProperty(ifindex)) {
    nodeInfo.ifindexSetSize++;
    nodeInfo.ifindexSet[ifindex] = 0;
    Object.keys(nodeInfo.ifindexSet).sort((x,y) => x - y).forEach((el,index) => nodeInfo.ifindexSet[el] = index);
  }
  return (nodeInfo.index + (nodeInfo.ifindexSet[ifindex] / nodeInfo.ifindexSetSize)) / nodeSetSize;
}

function getFlows(now) {
  var result = [];
  var flows = activeFlows(agents,'heatmap',maxFlows,1,'topology' == mode ? 'edge' : aggMode);
  var maxVal = flows.length > 0 ? Math.log10(flows[0].value) : 1;
  for(var i = 0; i < flows.length; i++) {
    let rec = flows[i];
    let [src,dst] = rec.key.split(',');
    let x, y, z = Math.log10(rec.value) / maxVal;
    if('topology' == mode) {
      x = portValue(src,now);
      if(x < 0) {
        continue;
      }
      y = portValue(dst,now);
      if(y < 0) {
        continue;
      }
    } else {
      x = ip2int(src);
      if(inset == 0 && (x < min || x > max)) {
        continue;
      } 
      y = ip2int(dst);
      if(inset == 0 && (y < min || y > max)) {
        continue;
      }
      x = scaleValue(x);
      y = scaleValue(y);
    }
    result.push({x:x,y:y,z:z});
  }
  return result;
}

setHttpHandler(function(req) {
  var result, path = req.path;
  if(!path || path.length == 0) throw "not_found";
  switch(path[0]) {
    case 'flows':
      result = getFlows(Date.now());
      break;
    case 'options':
      result = options;
      break;
  }
  return result;
});
