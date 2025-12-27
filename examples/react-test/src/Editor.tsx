import React, { useEffect } from 'react'
import YangEditorFacade, {YangEditor, type YangEditorMode} from "@cloudea/yang-editor";
import './Editor.css';
import '@cloudea/yang-editor/src/style.css';

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
                },
                components: {
                    foreColorStrip: {
                        colors: [
                            {name: '红色', color: 'rgba(228, 73, 91, 1)'},
                            {name: '橘色', color: 'rgba(255, 140, 0, 1)'},
                            {name: '黄色', color: 'rgba(255, 215, 0, 1)'},
                        ]
                    },
                    backColorStrip: {
                        colors: [
                            {name: '绿色', color: 'rgba(34, 139, 34, 1)'},
                            {name: '蓝色', color: 'rgba(30, 144, 255, 1)'},
                            {name: '紫色', color: 'rgba(138, 43, 226, 1)'},
                        ]
                    },
                    link: {
                        openInNewTab: true,
                    }
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



