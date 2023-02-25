import './App.css';
import * as React from 'react';

import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextareaAutosize from '@mui/material/TextareaAutosize';

import MenuItem from '@mui/material/MenuItem';

import {useEffect, useState} from 'react';
import fileDownload from 'js-file-download';


const axios = require('axios').default;


function App() {
  const languages = [{'code': 'hi', 'name': 'Hindi'},
                     {'code': 'mr', 'name': 'Marathi'},
                     {'code': 'en', 'name': 'English'}];

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
  const [alignment, setAlignment] = useState('text');
  

  useEffect(()=>{
    console.log(files);
  },[files])

  useEffect(()=>{
    if(alignment === 'text'){
      setText(true);
      setDoc(false);
    }
    if(alignment === 'document'){
      setText(false);
      setDoc(true);
    }
  },[alignment])
  const handleChange = async function(event){
    var value = event.target.value;
    setInput(value);
  }
  const handleToggle = (
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
   
   const params = JSON.stringify({'input': [{'source': input}],
                                  'config': {'language': {'sourceLanguage': source, 'targetLanguage': target}, 'model': model}});
  
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
    
  var formData = new FormData();
    console.log(files[0]);
    formData.append("files", files[0]);
    formData.append("data", params);
    console.log(formData);

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

    });

  };

  
  return (
    <div className="App">
      <nav class="navbar navbar-dark bg-primary" style={{"font-weight": "bold", "font-size": "30px"}}>
        <span class="navbar-brand mb-0 h1">IIT Bombay Machine Translation</span>
      </nav>

      <Box sx={{ width: '1200px', height: '500px', display: 'flex', flexDirection: 'column'}}>
        

        <>{ text &&
        <Box sx={{ display: 'flex', justifyContent: "center", flexDirection: 'row', m:1 }}>
          <Box sx={{ display: 'flex', justifyContent: "center", flexDirection: 'column', m:1}}>
            
            
            <TextField value={source} select label="Source" size="small" style={{"font-family": "inherit", height: "75px", width: "300px"}} onChange={e=>setSource(e.target.value)}>
              {languages.map(language=> <MenuItem key={language.code} value={language.code}>{language.name}</MenuItem>)}
            </TextField>
            <Paper elevation={5} sx={{height: 250, width: 500, overflow: 'auto'}}>
              <TextareaAutosize onChange={(e)=>{handleChange(e)}} aria-label="source textarea" placeholder="Enter source language text" style={{ height: 230, width: 480, m: 2, overflow: 'auto'}}/>
            </Paper>
          </Box>

          <Box sx={{position:"relative", display: 'flex', flexDirection: 'column', m:1 }}>
            <TextField value={target} select label="Target" size="small" style={{"font-family": "inherit", height: "75px", width: "300px"}} onChange={e=>setTarget(e.target.value)}>
              {languages.map(language=> <MenuItem key={language.code} value={language.code}>{language.name}</MenuItem>)}
            </TextField>
            <Paper elevation={5} sx={{height: 250, width: 500}}>
              <TextareaAutosize value={output} aria-label="target textarea" placeholder="Target language text" style={{ height: 230, width: 480, m: 2, overflow: 'auto' }} onChange={e=>setOutput(e.target.value)}/>
            </Paper>
          </Box>
        </Box>}
        </>
        
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
          <Button size="large" sx={{ "font-family": "inherit", "font-weight": "bold", "font-size": "20px", width: 200, height: 50}} variant="contained" onClick={e=>handleTranslate()}>Translate</Button>
        </Box>

      </Box>
    </div>
  );
}

export default App;
