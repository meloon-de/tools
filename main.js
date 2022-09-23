var gHubLink = 'https://raw.githubusercontent.com/meloon-de/tools/main/raman/default/slg.txt';
var ramanFile = 'raman/default/slg.txt';
var tempData = [];
var max = 0;
var layout;
var tempTwoDPeak= 0;
var tempGPeak = 0;
var tempDPeak = 0;
var ramanText;

//TODO
//Remove bar when pressing 'Update Graph' again

/****************************************
  VIEW
****************************************/
defaultPlotly();

/****************************************
  Click Handling
****************************************/

async function handleSearchRamanClick(){
  res = await searchFolder(RAMANLINK);
  generateSelectFromResult(res);
  console.log("Search directory under raman and send to select - success");
}

async function handleUpdateRamanClick(){
  // var data = [];
  // var ProgressBar = require('node_modules\progressbar.js');
  var bar = new ProgressBar.Line('#progressBar', {
    easing: 'easeInOut',
    color: '#FFFFCC',
  });

  //get directory id from select
  var select = document.getElementById('ramanSelect');
  var selectValue = select.options[select.selectedIndex].value;
  console.log("get value from select: " + selectValue + " - success");
  bar.animate(0.2);

  //searches files under directory and adds name and id to array
  res = await searchFile(selectValue);
  console.log("searchFile results: "+ res);
  files = res.result.files;
  console.log("files results: "+ files);
  for (let i in files){
    let dat = {
      "x": [],
      "y": [], 
      "mode": 'scatter',
      "name": files[i].name,
      "id": files[i].id,
    };
    tempData.push(dat);
    console.log("plot: " + files[i].name + " and " + dat);
    console.log(files[i].name + " array push - success");
  }
  console.log("file search under chosen directory and push - success");
  bar.animate(0.4);

  //sort file alphabetically for easier plotting
  //https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value?page=1&tab=trending#tab-top
  tempData.sort((a,b) => (a.name > b.name) ? 1 : ((b.name> a.name) ? -1 : 0));

  //downloads files and stores values to array
  for (let i in tempData){
    data = await downloadAndParse(tempData, tempData[i].id, i);
    // console.log("download for" + data[i].name + " - success");
    bar.animate(0.4 + (0.5*(i/tempData.length)));

    //Output D, G, 2D, ID/IG & approximate Layer thickness
    var valIDIG = tempData[i].DPeak/tempData[i].GPeak;
    valIDIG = valIDIG.toFixed(2);
    var valI2DIG = tempData[i].TwoDPeak/tempData[i].GPeak;
    valI2DIG = valI2DIG.toFixed(2);
    // tempData[i].name = tempData[i].name + ",D: " + tempData[i].DPeak + ",G: " + tempData[i].GPeak +  ",2D: " + tempData[i].TwoDPeak + ", ID/IG: " + valIDIG;
    tempData[i].name = tempData[i].name + ", ID/IG: " + valIDIG + ", I2D/IG: " + valI2DIG;
  }
  console.log(tempData);

  usePlotly(tempData);
  bar.animate(1);
  bar.destroy();
}

function generateSelectFromResult(res){
//programatically generates a html select from search result {object}
  folders = res.result.files;
  // console.log("files: " + folders);

  // var parent = document.getElementById("ramanControl");
  var parent = document.getElementById("ramanSelect");
  // var selectList = document.createElement("select");
  // selectList.id="ramanSelect";
  // parent.appendChild(selectList);

  //cleans up old search
  while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
  }

  for (let i in folders){
    var option = document.createElement("option");
    option.value = folders[i].id;
    option.text = folders[i].name;
    // console.log("option: " + folders[i].id);
    // console.log("option: " + folders[i].name);
    parent.appendChild(option);
  }
}

/**
 *  Sign in the user upon button click.
 *  Edited for Raman Search
 */
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    document.getElementById('signout_button').style.visibility = 'visible';
    document.getElementById('authorize_button').innerText = 'Refresh';
    // await listFiles();
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({prompt: 'consent'});
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({prompt: ''});
  }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').innerText = 'Authorize';
    document.getElementById('signout_button').style.visibility = 'hidden';
  }
}

/****************************************
  Plotting
****************************************/

/**
 * The default plot when the site opens
 */
async function defaultPlotly(){
  // Define Data

  console.log("defaultPlotly started");
  text = await useGithubFetch(gHubLink);
  console.log("successful useGithubFetch");
  var x = [];
  var y = [];
  var lines = text.split('\n');
  for(var line = 0; line < lines.length; line++){
      var lin = lines[line].split('\t');
      //filters out NaN of file which gives error to Math.max
      if (isNaN(lin[1])) {
        continue;
      }
      if (isNaN(lin[0])) {
        continue;
      }
      x.push(lin[0]);
      y.push(lin[1]);
  }
  console.log("file parsing - success");

  var xn = [];
  var yn = [];

  x.forEach(str => {
      xn.push(Number(str));
  });
  y.forEach(str => {
      yn.push(Number(str));
  });
  console.log("convert to number - success");
  // console.log(xn);
  // console.log(yn);

  var sample = {
    "x": xn,
    "y": yn,
    "type": "scatter",
    "name": "sample",
  };

  var data = [sample];

  layout = updatePlotlyLayout();

  RAMANDIV = document.getElementById('raman');
  Plotly.newPlot(RAMANDIV, data, layout);
  console.log("plotly plot - success");
}

function usePlotly(objArray){
//generate plots from object that contains name, xy arrays
  //PLOTLY
  //https://plotly.com/javascript/shapes/


  // Define Data
  var data = objArray;

  //Getting max value for height of highlights
  // var max = Math.max(...objArray.map(o => o.y));
  // max = Math.max(...objArray.map(o => o.y));
  // max = Math.max.apply(Math, objArray.map(function(o) { return o.y; }));
  // console.log("determine max - success");

  layout = updatePlotlyLayout();

  RAMANDIV = document.getElementById('raman');
  Plotly.newPlot(RAMANDIV, data, layout, {displaylogo: false});
  console.log("plotly plot - success");
}

function updatePlotlyLayout(){
  layout = {
    shapes: [
        {
            'type': 'rect',
            'xref': 'xaxis',
            'yref': 'yaxis',
            'x0': '1300',
            'y0': 0,
            'x1': '1400',
            'y1': 15000,
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
            'y1': 15000,
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
            'y1': 15000,
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
      yshift: -15,
      showarrow: false,
    },
    {
      x: 1600,
      y: 5,
      xref: 'x',
      yref: 'y',
      text: 'G',
      yshift: -15,
      showarrow: false,
    },
    {
      x: 2775,
      y: 5,
      xref: 'x',
      yref: 'y',
      text: '2D',
      yshift: -3,
      showarrow: false,
    },
    ],
    autosize:true,
    xaxis: {range: [1000, 3000], title: "Raman Shift (cm<sup>-1</sup>)"},
    yaxis: {range: [0, 15000], title: "Intensity (counts)"},
    title: "Graphene Raman Spectra",
    legend: {traceorder: "normal", 
             yanchor: "top",
             y: -1,
             xanchor: "left",
             x: 0.01
             },
  };
  return layout;
}


/****************************************
  Fetch & API Calls
****************************************/

async function downloadAndParse(objArray, fileID, index){
//downloads and parses Gdrive files using an array of objects, ID and index of 
//current object

    // text = await useGithubFetch(gHubLink);
    text = await downloadFile(fileID);
    text = text.body;
    var x = [];
    var y = [];
    var lines = text.split('\n');
    for(var line = 0; line < lines.length; line++){
        var lin = lines[line].split('\t');
        //filters out NaN of file which gives error to Math.max
        if (isNaN(lin[1])) {
          continue;
        }
        if (isNaN(lin[0])) {
          continue;
        }
        x.push(lin[0]);
        y.push(lin[1]);
    }
    console.log("file parsing - success");

    var xn = [];
    var yn = [];

    x.forEach(str => {
        xn.push(Number(str));
    });
    y.forEach(str => {
        yn.push(Number(str));
    });
    console.log("convert to number - success");

    //find max
    for (let i in xn){
      if (xn[i] > max){
        max = xn[i];
      }
    }
    for (let i in yn){
      if (yn[i] > max){
        max = yn[i];
      }
    }

    tempDPeak = 0;
    tempGPeak = 0;
    tempTwoDPeak = 0;

    //find D peak
    for (let i in yn){
      if (xn[i] > 1320 && yn[i] > tempDPeak && xn[i] < 1380){
        tempDPeak = yn[i];
      }
    }
    //find G peak
    for (let i in yn){
      if (xn[i] > 1550 && yn[i] > tempGPeak && xn[i] < 1650){
        tempGPeak = yn[i];
      }
    }
    //find 2D peak
    for (let i in yn){
      if (xn[i] > 2600 && yn[i] > tempTwoDPeak && xn[i] < 2750){
        tempTwoDPeak= yn[i];
      }
    }

    objArray[index].x = xn;
    objArray[index].y = yn;
    objArray[index].DPeak = tempDPeak.toFixed(2);
    objArray[index].GPeak = tempGPeak.toFixed(2);
    objArray[index].TwoDPeak = tempTwoDPeak.toFixed(2);

    //Attempt at outputting D, G, 2D, IDIG
    /*
    var ramanText = "Name: " + fileID + ", D: " + objArray[index].DPeak + ", G: " + objArray[i].GPeak +  ", 2D: " + objArray[index].TwoDPeak + ", $I_D/I_G$: " + objArray[index].DPeak/objArray[index].GPeak + "\n";
    console.log(ramanText);
    var textDiv = document.getElementById('textOutput');
    var content = document.createTextNode(ramanText);
    textDiv.appendChild(content);
    */

    // console.log("X: " + objArray[i].x);
    // console.log("Y: " + objArray[i].x);
    console.log("push to array - success");

    return objArray;
}

async function useFileFetch(link){
  // fetchs txt file, splts per line and splits columns to x & y
  try {
    let data = await fetch(link);
    return await data.text();
  } catch (error) {
      console.log("failed file download" + error);
      console.log(data.text());
  }
}

async function useGithubFetch(link){
  // fetchs txt file, splts per line and splits columns to x & y
  try {
    let data = await fetch(link);
    return await data.text();
  } catch (error) {
      console.log("failed file download" + error);
      console.log(data.text());
  }
}

async function downloadFile(fileId) {
/**
 * Downloads a file
 * @param{string} realFileId file ID
 * @return{obj} file status
 * */

  // Get credentials and build service
  /*
  const {GoogleAuth} = require('google-auth-library');
  const {google} = require('googleapis');

  const auth = new GoogleAuth({scopes: 'https://www.googleapis.com/auth/drive'});
  const service = google.drive({version: 'v3', auth});
  */
  try {
    // const file = await service.files.get({
    // response = await gapi.client.drive.files.list({
    const file = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
      fields: 'name',
    });
    console.log("file download " + fileId + " - success");
    return file;
  } catch (err) {
      console.log("Error getting " + fileId);
    throw err;
  }
}

async function searchFolder(fileID) {
/**
 * Search file in drive location
 * @return{obj} data file
 * */
  try {
    const res = await gapi.client.drive.files.list({
      q: `mimeType = 'application/vnd.google-apps.folder' and '${fileID}' in parents`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });
    console.log(res);
    // return res.data.files;
    return res;
  } catch (err) {
      console.log("Error with directory search");
    throw err;
  }
}

async function searchFile(fileID) {
/**
 * Search file in drive location
 * @return{obj} data file
 * */
  try {
    const res = await gapi.client.drive.files.list({
      q: `'${fileID}' in parents`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });
    console.log(res);
    // return res.data.files;
    return res;
  } catch (err) {
      console.log("Error with directory search");
    throw err;
  }
}


/****************************************
  GOOGLE API AUTH
****************************************/

/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive';


let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('authorize_button').style.visibility = 'visible';
  }
}