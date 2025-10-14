import React, { useEffect } from 'react'
import YangEditor from "yang-editor";
import './Editor.css';
import 'yang-editor/src/style.css';

const Editor = function () {

    const [inited, setInited] = React.useState(false);

    useEffect(() => {
        if(!inited){
            YangEditor.create({
                elem: 'editor',
            });
            setInited(true);
        }
    }, []);

    return <div className={"components-editor"} id='editor'></div>;
}

export default Editor;



