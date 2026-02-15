$(function() {
  var restPath = '../scripts/flows.js/';
  var optionsURL = restPath + 'options/json';
  var dataURL = restPath + 'flows/json';

  $.get(optionsURL,function(opts) {
    var widget = $('#traffic').heatmap(opts);
    var _data = [];
    function draw(data) {
      _data = data;
      widget.heatmap('draw',_data);
    }
    function redraw() {
      widget.heatmap('draw',_data);
    }
    $(window).resize(redraw);
    (function pollFlows() {
      $.ajax({
        url: dataURL,
        success: function(data) {
          draw(data);
        },
        error: function(result,status,errorThrown) {
          draw([]);
        },
        complete: function() {
          setTimeout(pollFlows,opts.update || 1000);
        },
        timeout: 60000
      });
    })();
  });
});
