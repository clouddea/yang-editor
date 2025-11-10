import React, { useEffect } from 'react'
import YangEditor from "yang-editor";
import './Editor.css';
import 'yang-editor/src/style.css';
import addIcon from './images/add@2x.png';
import menuIcon from './images/menu@2x.png';

const Editor = function () {

    const [inited, setInited] = React.useState(false);

    useEffect(() => {
        if(!inited){
            YangEditor.create({
                elem: 'editor',
                images: {
                    add: addIcon,
                    menu: menuIcon
                }
            });
            setInited(true);
        }
    }, []);

    return <div className={"components-editor"} id='editor'></div>;
}

export default Editor;



