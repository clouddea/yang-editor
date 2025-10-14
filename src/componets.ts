import {globalEventCenter} from "./context";
import YangEditorFacade from "./index";
import {Constants, DeleteParagraphData, SplitParagraphData} from "./common";

export interface EditorElement {
    getElement(): HTMLElement | undefined;
}

export interface EditorComponent extends EditorElement {
    onMount(): HTMLElement;
    onMounted(): void;
}

export class EditorContent implements EditorElement {
    public readonly element: HTMLDivElement;
    constructor(parent: HTMLElement) {
        this.element = document.createElement("div");
        this.element.classList.add("yang-editor-content");
        this.element.contentEditable = "true";
        parent.appendChild(this.element);

    }

    getElement(): HTMLElement {
        return this.element;
    }

}

function boldSelection() {
    const selection = window.getSelection();

    if (selection == null) {return;}

    if (!selection.rangeCount || selection.toString().trim() === '') {
        return;
    }

    const range = selection.getRangeAt(0);

    // 检查是否已经在加粗标签内
    let parentElement = range.commonAncestorContainer;
    while (parentElement && parentElement.nodeType !== 1 && parentElement.parentElement !== null) {
        parentElement = parentElement.parentElement;
    }

    let tagName = parentElement.nodeName.toUpperCase();

    if (parentElement && (tagName === 'STRONG' || tagName === 'B')) {
        // 如果已经在加粗标签内，则取消加粗
        if(parentElement.textContent != null && parentElement.parentNode !== null) {
            const textNode = document.createTextNode(parentElement.textContent);
            parentElement.parentNode.replaceChild(textNode, parentElement);
        }
    } else {
        // 执行加粗
        //document.execCommand('bold', false);


        const selectedContent = range.extractContents();
        // 创建加粗元素并包裹选中内容
        const boldElement = document.createElement('strong');
        boldElement.appendChild(selectedContent);

        // 将加粗的内容插入回文档
        range.insertNode(boldElement);
    }
}

export class EditorToolbar implements EditorElement {
    public readonly element: HTMLDivElement;
    constructor(parent: HTMLElement) {
        this.element = document.createElement("div");
        this.element.classList.add("yang-editor-toolbar");

        let button = document.createElement("button");
        button.classList.add("yang-editor-toolbar-button");
        button.innerText = "B";
        button.onclick = (e: MouseEvent) => {
            boldSelection();
        }
        this.element.appendChild(button);

        parent.appendChild(this.element);

    }

    getElement(): HTMLElement {
        return this.element;
    }
}

export class EditorParagraph implements EditorComponent {
    public  element: HTMLParagraphElement | undefined;
    public  text: HTMLDivElement | undefined;
    private enterCount: number = 0;
    private str: string = ""
    private focus: boolean = false;
    private focusTail: boolean = false;

    constructor(str?: string, focus?: boolean) {
        if(str !== undefined) {
            this.str = str;
        }
        if(focus !== undefined) {
            this.focus = focus;
        }
    }

    getFocus(): boolean {
        return this.focus;
    }

    setFocus(focus: boolean, focusTail: boolean = false) {
        this.focus = focus;
        this.focusTail = focusTail;
    }

    onMounted(): void {
        if(this.text !== undefined && this.focus) {
            let range = document.createRange();
            range.selectNodeContents(this.text);
            range.collapse(false);
            // range.setStart(this.text, 0);
            // range.setEnd(this.text, 0);
            document.getSelection()?.removeAllRanges();
            document.getSelection()?.addRange(range);
        }
    }

    onMount() : HTMLElement {
        let element = document.createElement("p");
        element.classList.add("yang-editor-paragraph");
        element.contentEditable = "false";
        // this.element.tabIndex = 0;
        // this.element.addEventListener('focus', function(){
        //     this.classList.add('yang-editor-paragraph-focused');
        // });
        //
        // this.element.addEventListener('blur', function(){
        //     this.classList.remove('yang-editor-paragraph-focused');
        // });
        // FIXME: fix focus
        let text = document.createElement("div");
        text.innerHTML = this.str;
        element.appendChild(text);

        let deleteButton = document.createElement("button");
        deleteButton.classList.add("yang-editor-paragraph-delete");
        deleteButton.innerText = "Delete";
        deleteButton.onclick = () => {globalEventCenter.emit<DeleteParagraphData>(Constants.EV_DELETE_PARAGRAPH, {
            sourceComponent: this,
        })};
        element.appendChild(deleteButton);

        const events = ['input', 'paste', 'cut', 'keydown', 'compositionend'];
        events.forEach(event => {
            text.addEventListener(event, (ev) => {
                this.str = text.innerHTML;
            });
        });

        const observer = new MutationObserver((mutations) => {
            // mutations.forEach(function(mutation) {
            //     console.log('变化类型:', mutation.type);
            //
            //     if (mutation.type === 'characterData') {
            //         console.log('文本内容变化:', mutation.target.textContent);
            //     } else if (mutation.type === 'childList') {
            //         console.log('子节点变化:', mutation);
            //         mutation.addedNodes.forEach(node => {
            //             console.log('新增节点:', node);
            //         });
            //         mutation.removedNodes.forEach(node => {
            //             console.log('删除节点:', node);
            //         });
            //     }
            // });
            this.str = text.innerHTML;
        });

        // 开始观察
        observer.observe(text, {
            childList: true,     // 观察直接子节点的变动
            subtree: true,       // 观察所有后代节点的变动
            characterData: true, // 观察节点内容或文本的变动
            attributes: true,    // 观察属性的变动
            attributeFilter: ['style', 'class'] // 只观察特定属性
        });

        text.addEventListener ("keydown", (event: KeyboardEvent) => {
            if(event.key === "Backspace") {
                if (text.innerText.trim() === "") {
                    globalEventCenter.emit<DeleteParagraphData>(Constants.EV_DELETE_PARAGRAPH, {
                        sourceComponent: this,
                    })
                    event.stopPropagation();
                    event.preventDefault()
                }
                return;
            }
            if(!event.shiftKey && event.key === "Enter") {

                this.enterCount ++;
                if(this.enterCount == 2) {
                    this.enterCount = 0;
                    event.preventDefault();
                    let selection = document.getSelection();
                    if(selection != null && selection.isCollapsed) {
                        let range = selection.getRangeAt(0);
                        // 计算光标位置
                        const preCaretRange = range.cloneRange();
                        preCaretRange.selectNodeContents(text);
                        preCaretRange.setStart(range.startContainer, range.startOffset);
                        if(preCaretRange.toString().length === 0){
                            let leftString =  text.innerHTML.trim();
                            let rightString = "";

                            globalEventCenter.emit<SplitParagraphData>(Constants.EV_SPLIT_PARAGRAPH, {
                                sourceComponent: this,
                                leftText: leftString,
                                rightText: rightString,
                            });
                        }

                    }
                }
            } else {
                this.enterCount = 0;
            }

        });
        text.classList.add("yang-editor-paragraph-text");
        text.contentEditable = "true";

        this.element = element;
        this.text = text;
        return this.element;
    }

    getElement(): HTMLElement | undefined {
        return this.element;
    }
}

