// author: InMon Corp.
// version: 0.1
// date: 2/12/2026
// description: Heatmap flow animation
// copyright: Copyright (c) 2026 InMon Corp.

var options = {};

if(getSystemProperty('heatmap.update')) options.update = parseFloat(getSystemProperty('heatmap.update'));
if(getSystemProperty('heatmap.radius')) options.radius = parseFloat(getSystemProperty('heatmap.radius'));
if(getSystemProperty('heatmap.height')) options.height = getSystemProperty('heatmap.height');

var agents    = getSystemProperty('heatmap.agents')    || 'ALL';
var aggMode   = getSystemProperty('heatmap.aggMode')   || 'MAX';
var maxFlows  = getSystemProperty('heatmap.maxFlows')  || '1000';
var t         = getSystemProperty('heatmap.t')         || '2';
var n         = getSystemProperty('heatmap.n')         || '20';
var value     = getSystemProperty('heatmap.value')     || 'bytes';
var filter    = getSystemProperty('heatmap.filter')    || null;
var minIP     = getSystemProperty('heatmap.ip.start')  || '0.0.0.0';
var maxIP     = getSystemProperty('heatmap.ip.end')    || '255.255.255.255';
var ipLayer   = getSystemProperty('heatmap.ip.layer')  || '';

setFlow('heatmap',{keys:'ipsource'+ipLayer+',ipdestination'+ipLayer,value:value,filter:filter,n:20,t:t});

function ip2int(ip) {
  return ip.split('.').reduce(function(ipInt, octet) { return (ipInt<<8) + parseInt(octet, 10)}, 0) >>> 0;
}

var min = ip2int(minIP);
var max = ip2int(maxIP);
var range = max - min;

function getFlows() {
  var result = [];
  var flows = activeFlows(agents,'heatmap',maxFlows,1,aggMode);
  var maxVal = flows.length > 0 ? Math.log10(flows[0].value) : 1;
  for(var i = 0; i < flows.length; i++) {
    let rec = flows[i];
    let [src,dst] = rec.key.split(',');
    let x = ip2int(src);
    if(x < min || x > max) {
      continue;
    } 
    let y = ip2int(dst);
    if(y < min || y > max) {
      continue;
    }
    result.push({x:(x-min)/range,y:(y-min)/range,z:Math.log10(rec.value) / maxVal});
  }
  return result;
}

setHttpHandler(function(req) {
  var result, path = req.path;
  if(!path || path.length == 0) throw "not_found";
  switch(path[0]) {
    case 'flows':
      result = getFlows();
      break;
    case 'options':
      result = options;
      break;
  }
  return result;
});
