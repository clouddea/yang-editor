import React from 'react';
import logo from './logo.svg';
import './App.css';
import Editor from "./Editor";

function App() {
  const [editorContent, setEditorContent] = React.useState<string>("");

  return (
    <div className="App">
        <Editor id='editor1' mode='edit' onChange={setEditorContent} />

        <Editor id='editor2' content={editorContent} mode='readonly'/>
        
    </div>
  );
}

export default App;
