var x = [];
var y = [];

function usePlotly(xn, yn){
  //PLOTLY
  //References
  //https://plotly.com/javascript/shapes/

  // Define Data
  var data = [{
    x: xn,
    y: yn,
    type:"scatter"
  }];

  // Define Layout
  var layout = {
    shapes: [
        {
            'type': 'rect',
            'xref': 'xaxis',
            'yref': 'yaxis',
            'x0': '1300',
            'y0': 0,
            'x1': '1400',
            'y1': 100,
            'fillcolor': 'yellow',
            'opacity': 0.2,
            'line': {
                'width': 0,
            }
        }
    ],
    autosize:true,
    //yaxis: {range: [50, 100], title: "Intensity (counts)"},
    xaxis: {range: [1000, 3000], title: "Raman Shift (cm<sup>-1</sup>)"},
    yaxis: {title: "Intensity (counts)"},
    title: "Raman Spectra"
  };

  TESTER2 = document.getElementById('raman');
  Plotly.newPlot(TESTER2, data, layout);
  console.log("plotly plot success");
}

function useChartjs(xn, yn){
  //CHART.JS
  new Chart(document.getElementById('myChart'), {
    type: 'line',
    data: {
      //labels: 'Frequency (cm$&{-1}$)',
      labels: xn,
      datasets: [{
        label: 'Intensity (counts)',
        data: yn,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }],
    }
  });
  console.log("chartjs plot success");
}


// fetchs txt file, splts per line and splits columns to x & y
fetch('https://raw.githubusercontent.com/meloon-de/tools/main/raman/2022-07-15/G-P-3s_D1_pos1.txt')
.then(response => response.text())
.then(text => {
  var lines = text.split('\n');
  for(var line = 0; line < lines.length; line++){
      var lin = lines[line].split('\t');
      x.push(lin[0]);
      y.push(lin[1]);
  }
  console.log("file parsing success");

  var xn = [];
  var yn = [];

  x.forEach(str => {
      xn.push(Number(str));
  });
  y.forEach(str => {
      yn.push(Number(str));
  });
  console.log("convert to number success");

  usePlotly(xn,yn);
  useChartjs(xn,yn);


});