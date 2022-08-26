var gHubLink = 'https://raw.githubusercontent.com/meloon-de/tools/main/raman/default/slg.txt';
var ramanFile = 'raman/default/slg.txt';
var tempData = [];
var max = 0;
var layout;

defaultPlotly();

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

  //downloads files and stores xy value to array
  for (let i in tempData){
    data = await downloadAndParse(tempData, tempData[i].id, i);
    // console.log("download for" + data[i].name + " - success");
    bar.animate(0.4 + (0.5*(i/tempData.length)));
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
    // autosize:true,
    xaxis: {range: [1000, 3000], title: "Raman Shift (cm<sup>-1</sup>)"},
    yaxis: {range: [0, 15000], title: "Intensity (counts)"},
    title: "Standard Single Layer Graphene Raman Spectra",
    legend: {traceorder: "normal"},
  };
  return layout;
}

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

    objArray[index].x = xn;
    objArray[index].y = yn;
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

//GOOGLE API AUTH
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

/**
 *  Sign in the user upon button click.
 */
//EDITED FOR RAMAN SEARCH
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

/**
 * Print metadata for first 10 files.
 */
async function listFiles() {
  let response;
  try {
    response = await gapi.client.drive.files.list({
      'pageSize': 10,
      'fields': 'files(id, name)',
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }
  const files = response.result.files;
  if (!files || files.length == 0) {
    document.getElementById('content').innerText = 'No files found.';
    return;
  }
  // Flatten to string to display
  const output = files.reduce(
      (str, file) => `${str}${file.name} (${file.id}\n`,
      'Files:\n');
  document.getElementById('content').innerText = output;
}

// window.onload = function(){
  // defaultPlotly();
// };

// document.addEventListener("DOMContentLoaded", function() {
//   defaultPlotly();
// });