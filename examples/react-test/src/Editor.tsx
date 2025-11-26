import React, { useEffect } from 'react'
import YangEditorFacade, {YangEditor, type YangEditorMode} from "yang-editor";
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
import deleteIcon from './images/delete@2x.png';
import copyIcon from './images/copy@2x.png';
import cutIcon from './images/cut@2x.png';

type EditorProps = {
    id: string;
    content?: string;
    onChange?: (html: string) => void;
    mode: YangEditorMode
}

const Editor = function (props: EditorProps) {

    const [inited, setInited] = React.useState<boolean>(false);
    const [editor, setEditor] = React.useState<YangEditor | null>(null);

    console.log("Editor props:", props);

    useEffect(() => {
        if(!inited){
            let editor = YangEditorFacade.create({
                elem: props.id,
                width: '800px',
                height: 'auto',
                mode: props.mode,
                images: {
                    add: addIcon,
                    menu: menu2Icon,
                    bold: boldIcon,
                    italic: italicIcon,
                    underline: underlineIcon,
                    deleteline: deletelineIcon,
                    link: linkIcon,
                    clear: clearIcon,
                    down: downIcon,
                    delete: deleteIcon,
                    copy: copyIcon,
                    cut: cutIcon,
                },
                events: {
                    onContentChange: props.onChange,
                }
            });
            if (props.content) {
                editor.setHTMLContent(props.content);
            }
            setInited(true);
            setEditor(editor);
        } else {
            if (editor) {
                editor.setHTMLContent(props.content || "");
            }
        }
    }, [props.content]);

    return <div className={"components-editor"} id={props.id}></div>;
}

export default Editor;



