// import logo from './logo.svg';
import './App.css';
import * as React from 'react';

import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';
import StopCircleIcon from '@mui/icons-material/StopCircle';
// import { createMuiTheme, ThemeProvider } from '@material-ui/core';
// import AudioPlayer from 'react-h5-audio-player';
// import 'react-h5-audio-player/lib/styles.css';
// import ReactAudioPlayer from 'react-audio-player';
// import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';


import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
// import AppBar from '@mui/material/AppBar';
// import Typography from '@mui/material/Typography';
// import Toolbar from '@mui/material/Toolbar';


// import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
// import InputLabel from '@mui/material/InputLabel';
// import FormControl from '@mui/material/FormControl';
import TextareaAutosize from '@mui/material/TextareaAutosize';

import {useEffect, useState} from 'react';
import FileUpload from 'react-material-file-upload';
import fileDownload from 'js-file-download';

import { ReactMic } from 'react-mic';

// import AudioPlayer from 'material-ui-audio-player';

import hark from 'hark';

const axios = require('axios').default;

var getUserMedia = require('getusermedia')

getUserMedia({video: false, audio: true}, function(err, stream) {
  if (err) {
    console.log('failed');
 } else {
    console.log('got a stream', stream);  
 }


  var options = {};
  var speechEvents = hark(stream, options);

  speechEvents.on('speaking', function() {
    console.log('speaking');
  });

  speechEvents.on('stopped_speaking', function() {
    console.log('stopped_speaking');
  });
});


function App() {
  // const [languages, setLanguages] = useState([]);
  const languages = [{'code': 'hi', 'name': 'Hindi'},
                     {'code': 'mr', 'name': 'Marathi'},
                     {'code': 'en', 'name': 'English'}];
  const models = [{'code': 'baseline', 'name': 'Baseline'},
                  {'code': 'cross', 'name': 'Cross Attention Finetuning'},
                  {'code': 'pivot', 'name': 'Direct Pivoting'},
                  {'code': 'multi-pivot', 'name': 'Multiple Pivot Languages'},
                  {'code': 'm2m-100', 'name': 'Multilingual En-Indic'}
                ];
  const [source, setSource] = useState("en");
  const [target, setTarget] = useState("mr");
  const [model, setModel] = useState("m2m-100");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [files, setFiles] = useState([]);
  const [output_files, setOutputFiles] = useState();
  const [download, setDownload] = useState(true);
  const [text, setText] = useState(true);
  const [doc, setDoc] = useState(false);
  const [speech, setSpeech] = useState(false);
  const [alignment, setAlignment] = useState('text');
  const [audioFile, setAudioFile] = useState("");
  const [outputAudioFile, setOutputAudioFile] = useState("");
  const [audioBlob, setAudioBlob] = useState();
  // const muiTheme = createMuiTheme({});

  
  const [record, setRecord] = useState(false);

  const startRecording = ()=>{
    setRecord(true);
  }

  const stopRecording = ()=>{
    setRecord(false);
  }

  const onData = function(recordedBlob){
    // console.log(recordedBlob);
  }

  const onStop = function(recordedBlob){
    setAudioBlob(recordedBlob);
    var url = URL.createObjectURL(recordedBlob.blob);
    setAudioFile(url);
    console.log(url);
    console.log(audioFile);
    translate_speech(recordedBlob);
  }
  
  const handleChangle = async function(event){
    var value = event.target.value;
    setInput(value);
  }
  useEffect(()=>{
    if(model !== "m2m-100" && source.length > 0)
      translate();
  },[input, target])

  useEffect(()=>{
    console.log(files);
  },[files])

  useEffect(()=>{
    if(alignment === 'text'){
      setText(true);
      setDoc(false);
      setSpeech(false);
    }
    if(alignment === 'document'){
      setText(false);
      setDoc(true);
      setSpeech(false);
    }
    if(alignment === 'speech'){
      setText(false);
      setDoc(false);
      setSpeech(true);
    }
  },[alignment])

  const handleChange = (
    event,
    newAlignment,
  ) => {
    setAlignment(newAlignment);
  };

  const handleTranslate = ()=>{
    if(files.length > 0){
      setDownload(true);
      translate_file();
    }
    else{
      setOutput("");
      translate();
    }
  }

  const onDownload = ()=>{
    var filename = target + "_" + files[0].name;
    fileDownload(output_files, filename);
  }
  const translate = ()=>{
    console.log(source);
    console.log(target);
    // setOutput("");
    var api_url = "";

    if( (source === "en" && target === "mr") || (source === "mr" && target === "en") )
      api_url = "https://www.cfilt.iitb.ac.in/en-mr-v1/";
    else if( (source === "en" && target === "hi") || (source === "hi" && target === "en") ){
      setModel("");
      api_url = "https://www.cfilt.iitb.ac.in/en-hi-v1/";
    }
    else if( (source === "hi" && target === "mr") || (source === "mr" && target === "hi") ){
      setModel("Phrase Table Injection");
      api_url = "https://www.cfilt.iitb.ac.in/hi-mr-v1/";
    }
   
    // const params = new URLSearchParams();
    // params.append('input', [{'source': input}]);
    // params.append('config',{'language': {'sourceLanguage': source, 'targetLanguage': target}});
    const params = JSON.stringify({'input': [{'source': input}],
                                  'config': {'language': {'sourceLanguage': source, 'targetLanguage': target}, 'model': model}});
    // params.append('target', target);
    // params.append('api_key', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
    // console.log(input)
    
    console.log(api_url);
      console.log(params);

    axios.post(api_url,
    params,
    {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }
    ).then(res=>{
      // console.log(res.data.output[0].target);
      setOutput(res.data.output[0].target);
    });

  };

  const translate_file = ()=>{
    var api_url = "";
    console.log(source);
    console.log(target);

    if( (source === "en" && target === "mr") || (source === "mr" && target === "en") )
      api_url = "https://www.cfilt.iitb.ac.in/en-mr-v1/";
    else if( (source === "en" && target === "hi") || (source === "hi" && target === "en") ){
      setModel("");
      api_url = "https://www.cfilt.iitb.ac.in/en-hi-v1/";
    }
    const params = JSON.stringify({'input': [{'source': input}],
                                  'config': {'language': {'sourceLanguage': source, 'targetLanguage': target,'model': 'm2m-100'}}});
    
    // const blob = new Blob([params], {
    //   type: 'application/json'
    // });
    var formData = new FormData();
    console.log(files[0]);
    formData.append("files", files[0]);
    formData.append("data", params);
    console.log(formData);

    // axios.post('https://www.cfilt.iitb.ac.in/en-hi-v1/',
    // formData,{
    //   headers:{
    //     'Content-Type': 'multipart/form-data'
    //   }
    // }
    // ).then(res=>{
    //   console.log("received");
    //   // setOutput(res.data.output[0].target);
    // });
    axios({
      method: 'POST',
      url: api_url,
      data: formData,
      headers:{'Content-Type': 'multipart/form-data'}
      }).then(res=>{
          console.log(res);
          setOutputFiles(res.data);
          setDownload(false);
          console.log(download);
          // fileDownload(res.data, "output.txt");
        //   // setOutput(res.data.output[0].target);
    });

  };

  
  const translate_speech = (recordedBlob)=>{
    // setOutput("");
    console.log(source);
    console.log(target);
    var api_url = "https://www.cfilt.iitb.ac.in/en-hi-v1/";
    
    const params = JSON.stringify({'input': [{'source': input}],
                                  'config': {'language': {'sourceLanguage': source, 'targetLanguage': target}, 'model': model}});
    // var file = new File(audioBlob, "audio");
    console.log("speech translate");
    // console.log(recordedBlob);
    var formData = new FormData();
    formData.append('files', recordedBlob['blob']);
    formData.append("data", params);
    // console.log(formData);
    // console.log(api_url);
    // console.log(params);

    axios({
      method: 'POST',
      url: api_url,
      data: formData,
      headers:{'Content-Type': 'multipart/form-data'},
      responseType: 'blob',
      }).then(res=>{
          var url = URL.createObjectURL(new Blob([res.data], {type: 'audio/wav'}));
          setOutputAudioFile(url);
          // console.log(url);
          // console.log(outputAudioFile);
    });

  };

  return (
    <div className="App">
      <nav class="navbar navbar-dark bg-primary" style={{"font-weight": "bold", "font-size": "30px"}}>
        <span class="navbar-brand mb-0 h1">IIT Bombay Machine Translation</span>
      </nav>
      {/* <Box sx={{ flexGrow: 1, margin: "0" }}>
        <AppBar sx={{margin: "0"}} position="relative">
          <Toolbar variant="dense">
            <Typography variant="h6" color="inherit" component="div">
              Photos
            </Typography>
          </Toolbar>
        </AppBar>
      </Box> */}

      <Box sx={{ width: '1200px', height: '500px', display: 'flex', flexDirection: 'column'}}>
        
      <ToggleButtonGroup
        color="primary"
        value={alignment}
        exclusive
        onChange={handleChange}
      >
        <ToggleButton value="text">Text</ToggleButton>
        <ToggleButton value="document">Document</ToggleButton>
        <ToggleButton value="speech">Speech</ToggleButton>
      </ToggleButtonGroup>
        <>{ text &&
        <Box sx={{ display: 'flex', justifyContent: "center", flexDirection: 'row', m:1 }}>
          <Box sx={{ display: 'flex', justifyContent: "center", flexDirection: 'column', m:1}}>
            <TextField value={model} select label="Model" size="small" style={{"font-family": "inherit", height: "75px", width: "300px"}} onChange={e=>setModel(e.target.value)}>
                {models.map(m=> <MenuItem key={m.code} value={m.code}>{m.name}</MenuItem>)}
            </TextField>
            
            <TextField value={source} select label="Source" size="small" style={{"font-family": "inherit", height: "75px", width: "300px"}} onChange={e=>setSource(e.target.value)}>
              {languages.map(language=> <MenuItem key={language.code} value={language.code}>{language.name}</MenuItem>)}
            </TextField>

            <Paper elevation={5} sx={{height: 250, width: 500, overflow: 'auto'}}>
              <TextareaAutosize onChange={(e)=>{handleChangle(e)}} aria-label="source textarea" placeholder="Enter source language text" style={{ height: 230, width: 480, m: 2, overflow: 'auto'}}/>
            </Paper>
          </Box>

          <Box sx={{position:"relative", top:"75px", display: 'flex', flexDirection: 'column', m:1 }}>
            <TextField value={target} select label="Target" size="small" style={{"font-family": "inherit", height: "75px", width: "300px"}} onChange={e=>setTarget(e.target.value)}>
              {languages.map(language=> <MenuItem key={language.code} value={language.code}>{language.name}</MenuItem>)}
            </TextField>
            <Paper elevation={5} sx={{height: 250, width: 500}}>
              <TextareaAutosize value={output} aria-label="target textarea" placeholder="Target language text" style={{ height: 230, width: 480, m: 2, overflow: 'auto' }} onChange={e=>setOutput(e.target.value)}/>
            </Paper>
          </Box>
        </Box>}
        </>
        <>{ doc &&
          <Box sx={{ display: 'flex', flexDirection: 'column', m:1}}>
            <Box sx={{ display: 'flex', justifyContent: "center", flexDirection: 'row', m:1}}>
              <TextField sx={{mr: 5}} value={source} select label="Source" size="small" style={{"font-family": "inherit", height: "75px", width: "300px"}} onChange={e=>setSource(e.target.value)}>
                {languages.map(language=> <MenuItem key={language.code} value={language.code}>{language.name}</MenuItem>)}
              </TextField>
              <TextField sx={{ml: 5}} value={target} select label="Target" size="small" style={{"font-family": "inherit", height: "75px", width: "300px"}} onChange={e=>setTarget(e.target.value)}>
                {languages.map(language=> <MenuItem key={language.code} value={language.code}>{language.name}</MenuItem>)}
              </TextField>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: "center", flexDirection: 'row', m:1}}>
              <FileUpload sx={{width: "400px"}} value={files} onChange={setFiles} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: "center", flexDirection: 'row', m:1}}>
              <Button size="large" sx={{mt: 1, height: "50px", width: "200px"}} onClick={onDownload} disabled={download} variant="contained" color="primary">
                Download
              </Button>
            </Box>
          </Box>
          }
        </>

        <>{ speech &&
          <Box sx={{ display: 'flex', flexDirection: 'column', m:1}}>
            <Box sx={{ display: 'flex', justifyContent: "center", flexDirection: 'row'}}>
              <TextField value={source} select label="Source" size="small" style={{"font-family": "inherit", height: "50px", width: "300px"}} onChange={e=>setSource(e.target.value)}>
                {languages.map(language=> <MenuItem key={language.code} value={language.code}>{language.name}</MenuItem>)}
              </TextField>
              <TextField sx={{ml: 5}} value={target} select label="Target" size="small" style={{"font-family": "inherit", height: "75px", width: "300px"}} onChange={e=>setTarget(e.target.value)}>
                {languages.map(language=> <MenuItem key={language.code} value={language.code}>{language.name}</MenuItem>)}
              </TextField>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: "center", flexDirection: 'row', m:1}}>
              <Paper sx={{ display: 'flex', justifyContent: "center", flexDirection: 'column', height: 300, width: 500, m:2}} elevation={5}>
              <TextareaAutosize aria-label="source textarea" placeholder="Source language text" style={{ height: 150, width: 480, m: 2, overflow: 'auto'}}/>
                <ReactMic
                record={record}
                className="sound-wave"
                onStop={onStop}
                onData={onData}
                strokeColor="#000000"
                backgroundColor="#FFFFFF"
                sampleRate={96000}
                mimeType="audio/wav" />

                <Box sx={{ display: 'flex', justifyContent: "center", flexDirection: 'row'}}>
                  <IconButton disabled={record} sx={{height: "50px", width: "50px", "m-r": "2"}} onClick={startRecording} type="button"><MicIcon fontSize="large"/></IconButton>
                  
                  <IconButton disabled={!record} sx={{height: "50px", width: "50px", "m-l": "2"}} onClick={stopRecording} type="button"><StopCircleIcon fontSize="large"/></IconButton>  
                </Box>
                <audio controls src={audioFile}></audio>
              </Paper>
              <Paper elevation={5} sx={{height: 300, width: 500, m:2}}>
                <TextareaAutosize aria-label="source textarea" placeholder="Target language text" style={{ height: 150, width: 480, m: 2, overflow: 'auto'}}/>
                <audio controls src={outputAudioFile}></audio>
              </Paper>
              
            </Box>
          </Box>
          }
        </>
        
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
          <Button size="large" sx={{ "font-family": "inherit", "font-weight": "bold", "font-size": "20px", width: 200, height: 50}} variant="contained" onClick={e=>handleTranslate()}>Translate</Button>
        </Box>

      </Box>
    </div>
  );
}

export default App;
