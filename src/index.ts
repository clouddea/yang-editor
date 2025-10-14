import {EditorComponent, EditorContent, EditorParagraph, EditorToolbar} from "./componets";
import {globalEventCenter} from "./context";
import {Event} from "./event";
import {Constants, DeleteParagraphData, SplitParagraphData} from "./common";

interface YangEditorOptions {
    elem: string;
}

class YangEditor {

    private element: HTMLElement;

    private components: Array<EditorComponent> = new Array<EditorComponent>();

    constructor(private options: YangEditorOptions) {
        let element = document.getElementById(options.elem);
        if(element === null ) {
            throw new Error(`Invalid Yang Editor option "${options.elem}"`);
        }
        this.element = element;
        this.element.classList.add("yang-editor");

        globalEventCenter.on(Constants.EV_INSERT_PARAGRAPH, this.insertParagraph.bind(this));
        globalEventCenter.on<SplitParagraphData>(Constants.EV_SPLIT_PARAGRAPH, this.splitParagraph.bind(this));
        globalEventCenter.on<DeleteParagraphData>(Constants.EV_DELETE_PARAGRAPH, this.deleteParagraph.bind(this));
    }

    render() {
        // clear elements
        this.element.innerHTML = "";
        // add components
        let toolbarArea = new EditorToolbar(this.element);
        let contentArea = new EditorContent(this.element);
        // default paragraph
        let hasFocusedParagraph = false;
        let hasEndParagraph = false;
        if(this.components.length > 0 && this.components[this.components.length - 1] instanceof EditorParagraph) {
            hasEndParagraph = true;
        }
        for(let component of this.components) {
            if(component instanceof EditorParagraph){
                if(component.getFocus()) {
                    hasFocusedParagraph = true;
                }
            }
        }
        if(!hasEndParagraph) {
            this.components.push(new EditorParagraph("", !hasFocusedParagraph));
        }

        // mounts
        for(let component of this.components) {
            let dom = component.onMount();
            contentArea.getElement().appendChild(dom);
        }
        // mounted
        for(let component of this.components) {
            component.onMounted()
        }

    }

    insertParagraph(event: Event<undefined>) {
        console.log("insert paragraph");
    }

    splitParagraph(event: Event<SplitParagraphData>) {
        let idx = this.components.indexOf(event.payload.sourceComponent);
        if (idx !== -1) {
            this.components.forEach(component => {
               if(component instanceof EditorParagraph){
                   component.setFocus(false);
               }
            });
            this.components = [
                ...this.components.slice(0, idx),
                new EditorParagraph(event.payload.leftText),
                new EditorParagraph(event.payload.rightText, true),
                ...this.components.slice(idx + 1),
            ];
            this.render();
        }
    }

    deleteParagraph(event: Event<DeleteParagraphData>) {
        let idx = this.components.indexOf(event.payload.sourceComponent);
        if (idx !== -1) {

            this.components.forEach(component => {
                if(component instanceof EditorParagraph){
                    component.setFocus(false);
                }
            });
            if(idx > 0) {
                let lastComponent = this.components[idx - 1];
                if(lastComponent instanceof EditorParagraph){
                    lastComponent.setFocus(true);
                }
            }

            this.components.splice(idx, 1);
            this.render();
        }
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

