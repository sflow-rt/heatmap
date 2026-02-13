$(function() {
  var restPath = '../scripts/flows.js/';
  var optionsURL = restPath + 'options/json';
  var dataURL = restPath + 'flows/json';

  $.get(optionsURL,function(opts) {
    var widget = $('#traffic').heatmap(opts);
    (function pollFlows() {
      $.ajax({
        url: dataURL,
        success: function(data) {
          widget.heatmap('draw',data);
        },
        error: function(result,status,errorThrown) {
          widget.heatmap('draw',[]);
        },
        complete: function() {
          setTimeout(pollFlows,opts.update || 1000);
        },
        timeout: 60000
      });
    })();
  });
});
