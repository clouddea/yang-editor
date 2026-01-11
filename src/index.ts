import {ComponentFactory, EditorBody, EditorComponent, EditorToolbar, EditorFunction} from "./componets";
import { SelectionUtils } from "./utils";
import {images} from "./images";

export type YangEditorMode = "edit" | "readonly";

export interface YangEditorColor {
    color: string;
    name: string;
}

export interface YangEditorMenuItem {
    name: string;
    icon: string;
    className?: string;
    callback?: EditorFunction;
    args?: any
}

export interface YangEditorOptions {
    elem: string;
    width: string;
    height: string;
    mode: YangEditorMode;
    events: {
        onContentChange?: (html: string) => void,
    },
    menus?: YangEditorMenuItem[],
    components?: {
        foreColorStrip?: {
            colors?: YangEditorColor[]
        },
        backColorStrip?: {
            colors?: YangEditorColor[]
        },
        link?: {
            openInNewTab?: boolean
        }
    }
}

const defaultOptions : YangEditorOptions = {
    menus: [
        { name: "折叠面板", icon: images.collapse2x, className: 'gray', callback: "insertCollapse", args: {className: "gray"} },
        { name: "图片", icon: images.image2x, args: null },
        { name: "代码块", icon: images.code2x, args: null },
    ],
    components: {},
    elem: "yang-editor",
    events: {},
    width: "100%",
    height: "auto",
    mode: 'edit'
}

export class YangEditor {

    public readonly element: HTMLElement;
    public readonly toolbar: EditorToolbar;
    public readonly body: EditorBody;
    public readonly selectionUtils: SelectionUtils;
    public readonly componentFactory: ComponentFactory;
    public readonly options: YangEditorOptions;

    private components: Array<EditorComponent> = new Array<EditorComponent>();

    constructor(options: YangEditorOptions) {
        this.options = {...defaultOptions, ...options};

        let element = document.getElementById(options.elem);
        if(element === null ) {
            throw new Error(`Invalid Yang Editor option "${options.elem}"`);
        }
        this.element = element;
        this.toolbar = new EditorToolbar(this);
        this.body = new EditorBody(this);
        this.selectionUtils = new SelectionUtils(this.element);
        this.componentFactory = new ComponentFactory(this);
    }

    render() {
        // clear elements
        this.element.classList.add("yang-editor");
        this.element.style.width = this.options.width;
        this.element.innerHTML = "";
        // add components
        if (this.options.mode === "edit") {
            this.element.appendChild(this.toolbar.onMount());
        }
        this.element.appendChild(this.body.onMount());
    }

    setHTMLContent(html: string) {
        this.body.content.getElement().innerHTML = html;
    }

    getHTMLContent(): string {
        return this.body.content.getElement().innerHTML;
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

