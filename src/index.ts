import {EditorComponent, EditorContent, EditorParagraph, EditorToolbar} from "./componets";
import {globalEventCenter} from "./context";
import {Event} from "./event";
import {Constants, DeleteParagraphData, SplitParagraphData} from "./common";

export interface YangEditorOptions {
    elem: string;
}

export class YangEditor {

    private readonly element: HTMLElement;
    private readonly toolbar: EditorToolbar;
    private readonly content: EditorContent;

    private components: Array<EditorComponent> = new Array<EditorComponent>();

    constructor(private options: YangEditorOptions) {
        let element = document.getElementById(options.elem);
        if(element === null ) {
            throw new Error(`Invalid Yang Editor option "${options.elem}"`);
        }
        this.element = element;
        this.toolbar = new EditorToolbar(this);
        this.content = new EditorContent(this);
    }

    render() {
        // clear elements
        this.element.classList.add("yang-editor");
        this.element.innerHTML = "";
        // add components
        this.element.appendChild(this.toolbar.onMount());
        this.element.appendChild(this.content.onMount());
    }

}

function create(options: YangEditorOptions): YangEditor {
     let yangEditor = new YangEditor(options);
     yangEditor.render();
     return yangEditor;
}

const YangEditorFacade =  {
    create,
}

export default YangEditorFacade;

