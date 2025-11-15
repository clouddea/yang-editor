import React, { useEffect } from 'react'
import YangEditor from "yang-editor";
import './Editor.css';
import 'yang-editor/src/style.css';
import addIcon from './images/add@2x.png';
import menuIcon from './images/menu@2x.png';
import menu2Icon from './images/menu2.svg';
import boldIcon from './images/bold@2x.png';
import italicIcon from './images/italic@2x.png';
import underlineIcon from './images/underline@2x.png';
import deletelineIcon from './images/deleteline@2x.png';
import linkIcon from './images/link@2x.png';
import clearIcon from './images/clear@2x.png';
import downIcon from './images/down@2x.png';

const Editor = function () {

    const [inited, setInited] = React.useState(false);

    useEffect(() => {
        if(!inited){
            YangEditor.create({
                elem: 'editor',
                width: '800px',
                height: '200px',
                images: {
                    add: addIcon,
                    menu: menu2Icon,
                    bold: boldIcon,
                    italic: italicIcon,
                    underline: underlineIcon,
                    deleteline: deletelineIcon,
                    link: linkIcon,
                    clear: clearIcon,
                    down: downIcon
                }
            });
            setInited(true);
        }
    }, []);

    return <div className={"components-editor"} id='editor'></div>;
}

export default Editor;



