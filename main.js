var gHubLink = 'https://raw.githubusercontent.com/meloon-de/tools/main/raman/2022-07-15/G-P-3s_D1_pos1.txt';


// defaultPlotly();

async function handleSearchRamanClick(){
  res = await searchFolder(ramanLink);
  generateSelectFromResult(res);
  console.log("Search directory under raman and send to select - success");
}

async function handleUpdateRamanClick(){
  var data = [];

  //get directory id from select
  var select = document.getElementById('ramanSelect');
  var selectValue = select.options[select.selectedIndex].value;
  console.log("get value from select" + selectValue + " - success");

  //searches files under directory and adds name and id to array
  files = await searchFile(selectValue);
  files = files.result.files;
  for (let i in files){
    let dat = {
      "id": files[i].id,
      "name": files[i].name,
      "x": [],
      "y": [], 
      "type": 'scatter',
    };
    data.push(dat);
    console.log(files[i].name + " array push - success");
  }
  console.log("file search under chosen directory - success");

  //downloads files and stores xy value to array
  for (let i in data){
    data = downloadAndParse(data, data[i].id);
    console.log("download for" + data[i].name + " - success");
  }

  usePlotly(data);
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

  for (let i in folders){
    var option = document.createElement("option");
    option.value = folders[i].id;
    option.text = folders[i].name;
    // console.log("option: " + folders[i].id);
    // console.log("option: " + folders[i].name);
    parent.appendChild(option);
  }
}

function defaultPlotly(){
  // Define Data
  var trace1 = {
    x: [1, 2, 3, 4],
    y: [10, 15, 13, 17],
    type: 'scatter'
  };

  var trace2 = {
    x: [1, 2, 3, 4],
    y: [16, 5, 11, 9],
    type: 'scatter'
  };

  var data = [trace1, trace2];

  var layout = {
    autosize:true,
    xaxis: {range: [1000, 3000], title: "Raman Shift (cm<sup>-1</sup>)"},
    yaxis: {title: "Intensity (counts)"},
  };

  RAMANDIV = document.getElementById('raman');
  Plotly.newPlot(RAMANDIV, data, layout);
  console.log("plotly plot - success");
}

function usePlotly(objArray){
//generate plots from object that contains name, xy arrays
  //PLOTLY
  //https://plotly.com/javascript/shapes/


  // Define Data
  var data = [objArrayj];

  //Getting max value for height of highlights
  var max = Math.max(...objArray.map(o => o.y));
  console.log("determine max - success");

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
            'y1': max + 20,
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
            'y1': max + 20,
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
            'y1': max + 20,
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

  RAMANDIV = document.getElementById('raman');
  Plotly.newPlot(RAMANDIV, data, layout);
  console.log("plotly plot - success");
}

async function downloadAndParse(objArray, fileID){
    // text = await useGithubFetch(gHubLink);
    text = await downloadFile(fileID);
    text = text.body;
    var x = [];
    var y = [];
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

    for (let i in objArray){
      objArray[i].x = xn;
      objArray[i].y = yn;
      console.log("X: " + objArray[i].x);
      console.log("Y: " + objArray[i].x);
    }

    return objArray;
}

async function useGithubFetch(gHubLink){
  // fetchs txt file, splts per line and splits columns to x & y
  try {
    let data = await fetch(gHubLink);
    return await data.text();
  } catch (error) {
      console.log("failed file download" + error);
      console.log(data.text());
  }
}

async function downloadFile(realFileId) {
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

  fileId = realFileId;
  try {
    // const file = await service.files.get({
    // response = await gapi.client.drive.files.list({
    const file = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
      fields: 'name',
    });
    console.log("file download success");
    return file;
  } catch (err) {
      console.log("Error getting the file");
    throw err;
  }
}

async function searchFolder(fileID) {
/**
 * Search file in drive location
 * @return{obj} data file
 * */
  fileID = ramanLink;
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
  fileID = ramanLink;
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
    await listFiles();
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