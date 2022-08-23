var x = [];
var y = [];

function usePlotly(xn, yn){
  //PLOTLY
  //References
  //https://plotly.com/javascript/shapes/

  //Getting max value for height of highlights
  var max = Math.max(...yn);

  // Define Data
  var data = [{
    x: xn,
    y: yn,
    type:"scatter",
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
            'y1': max,
            'fillcolor': 'yellow',
            'opacity': 0.2,
            'line': {
                'width': 0,
            }
        },
        {
            'type': 'rect',
            'xref': 'xaxis',
            'yref': 'yaxis',
            'x0': '1500',
            'y0': 0,
            'x1': '1700',
            'y1': max,
            'fillcolor': 'blue',
            'opacity': 0.2,
            'line': {
                'width': 0,
            }
        },
        {
            'type': 'rect',
            'xref': 'xaxis',
            'yref': 'yaxis',
            'x0': '2550',
            'y0': 0,
            'x1': '3000',
            'y1': max,
            'fillcolor': 'purple',
            'opacity': 0.2,
            'line': {
                'width': 0,
            }
        }
    ],
    annotations: [
    {
      x: 1350,
      y: 5,
      xref: 'x',
      yref: 'y',
      text: 'D',
      showarrow: false,
    },
    {
      x: 1600,
      y: 5,
      xref: 'x',
      yref: 'y',
      text: 'G',
      showarrow: false,
    },
    {
      x: 2775,
      y: 5,
      xref: 'x',
      yref: 'y',
      text: '2D',
      showarrow: false,
    },
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

// fetchs txt file, splts per line and splits columns to x & y
fetch('https://raw.githubusercontent.com/meloon-de/tools/main/raman/2022-08-22/raman\2022-08-22\G-1sec-PL_low-E_pos1 on Si.txt')
.then(response => response.text())
.then(text => {
  var lines = text.split('\n');
  for(var line = 0; line < lines.length; line++){
      var lin = lines[line].split('\t');
      //filters out NaN of file at the end which gives error to Math.max
      if (isNaN(lin[1])) {
        continue;
      }
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

});
