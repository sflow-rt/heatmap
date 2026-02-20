# heatmap
Real-time visualization of a traffic matrix as a heatmap

## To install

1. [Download sFlow-RT](https://sflow-rt.com/download.php)
4. Run command: `sflow-rt/get-app.sh sflow-rt heatmap`
5. Restart sFlow-RT

## Settings

| Property | Default | Description |
| -------- | ------- | ----------- |
| heatmap.update | 1000 | Display update interval (in mS) |
| heatmap.radius | 0.02 | Radius of each heatmap point (as a fraction of display width) |
| heatmap.agents | ALL | Set of agents used to create heatmap |
| heatmap.aggMode | MAX | How to aggregate flows across agents |
| heatmap.maxFlows | 1000 | Maximum number of flows to display |
| heatmap.t | 2 | Smoothing time constant (in seconds) |
| heatmap.n | 20 | Number of flows to track per port |
| heatmap.value | bytes | Value used to scale flows |
| heatmap.filter | | Filter traffic used in flows |
| heatmap.mode | range | Method for assigning flows to axis (range, topology) |
| heatmap.ip.start | 0.0.0.0 | First address in range |
| heatmap.ip.end | 255.255.255.255 | Last address in range |
| heatmap.ip.layer | | Set to ".1" to select innner addresses |
| heatmap.inset | 0 | Fraction of display width to allocate to addresses outside range |
| heatmap.topology.flow | ip | Flow type (ip, ip6, mac) |
| heatmap.topology.refresh | 60000 | Timeout for cached address to switch port mappings |

For more information, visit:
https://sFlow-RT.com
