import {EditorComponent, EditorContent, EditorParagraph, EditorToolbar} from "./componets";
import { SelectionUtils } from "./utils";

export interface YangEditorOptions {
    elem: string;
    width: string;
    height: string;
    images: {
        add: string,
        menu: string,
        bold: string,
        italic: string,
        underline: string,
        deleteline: string,
        link: string,
        clear: string,
        down: string
    }
}

export class YangEditor {

    public readonly element: HTMLElement;
    public readonly toolbar: EditorToolbar;
    public readonly content: EditorContent;
    public readonly selectionUtils: SelectionUtils;

    private components: Array<EditorComponent> = new Array<EditorComponent>();

    constructor(public options: YangEditorOptions) {
        let element = document.getElementById(options.elem);
        if(element === null ) {
            throw new Error(`Invalid Yang Editor option "${options.elem}"`);
        }
        this.element = element;
        this.toolbar = new EditorToolbar(this);
        this.content = new EditorContent(this);
        this.selectionUtils = new SelectionUtils(this.element);
    }

    render() {
        // clear elements
        this.element.classList.add("yang-editor");
        this.element.style.width = this.options.width;
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

