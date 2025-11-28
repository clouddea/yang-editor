import React, { useEffect } from 'react'
import YangEditorFacade, {YangEditor, type YangEditorMode} from "yang-editor";
import './Editor.css';
import 'yang-editor/src/style.css';

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



