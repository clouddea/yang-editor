import { YangEditor } from "./index";

export interface EditorElement {
}

export interface EditorComponent extends EditorElement {
    getElement(): HTMLElement;
    onMount(): HTMLElement;
    onMounted(): void;
}

export class EditorBody implements EditorComponent {
    public readonly element: HTMLDivElement;
    public readonly context: YangEditor;
    public readonly content: EditorContent;
    public readonly menuButton: ContentBeforeMenu;

    constructor(editor: YangEditor) {
        this.element = document.createElement("div");
        this.context = editor;
        this.content = new EditorContent(this.context);
        this.menuButton = new ContentBeforeMenu(this.context);
    }

    onMount(): HTMLElement {
        this.element.classList.add("yang-editor-body");
        this.element.appendChild(this.content.onMount());
        this.element.appendChild(this.menuButton.onMount());
        this.element.style.height = this.context.options.height;
        return this.element;
    }

    onMounted(): void {
        throw new Error("Method not implemented.");
    }

    getElement(): HTMLElement {
        return this.element;
    }

}

export class EditorContent implements EditorComponent {
    public readonly element: HTMLDivElement;
    public readonly context: YangEditor;

    static PARAGRAPH_STYLE = "yang-editor-paragraph";

    constructor(editor: YangEditor) {
        this.element = document.createElement("div");
        this.context = editor;
    }

    onMount(): HTMLElement {
        this.element.classList.add("yang-editor-content");
        this.element.contentEditable = "true";

        const observer = new MutationObserver((mutations) => {
            console.log("change")
            let childNodes = this.element.childNodes;
            if(childNodes.length === 0) {
                this.insertDefaultParagraph();
                return;
            }
            let modifiedNodes = new Array<Node>();
            // transform text nodes to paragraphs
            for(let node of childNodes) {
                if(node.nodeType === Node.TEXT_NODE) {
                    let p = document.createElement("p");
                    p.innerText = node.textContent || "";
                    node.replaceWith(p);
                } else if(node.nodeType === Node.ELEMENT_NODE) {
                    let nodeElem = node as HTMLElement;
                    let tag = nodeElem.tagName.toLowerCase();
                    if(tag !== 'p' && tag !== 'div') {
                        let p = document.createElement("p");
                        p.innerHTML = nodeElem.outerHTML;
                        node.replaceWith(p);
                    }
                }
            }

            // insert empty paragraph
            if(this.element.children.length > 0)  {
                let lastElement = this.element.children[this.element.children.length - 1];
                if (lastElement && lastElement?.childNodes.length > 0) {
                    let p = document.createElement("p");
                    this.element.appendChild(p);
                }
            }

            // tag every childnodes
            for(let node of this.element.children) {
                if(node.nodeType === Node.ELEMENT_NODE) {
                    let elem = node as HTMLElement;
                    if(!elem.classList.contains(EditorContent.PARAGRAPH_STYLE)) {
                        elem.classList.add(EditorContent.PARAGRAPH_STYLE);
                    }
                }
            }

            // add mousemove and mouseleave event to every child nodes
            for(let node of this.element.children) {
                if(node.nodeType === Node.ELEMENT_NODE) {
                    let elem = node as HTMLElement;
                    elem.onmousemove = () => {
                        this.context.body.menuButton.show(elem);
                    };
                    elem.onmouseleave = () => {
                        this.context.body.menuButton.hide();
                    };
                }
            }

        });

        // 开始观察
        observer.observe(this.element, {
            childList: true,     // 观察直接子节点的变动
            subtree: true,       // 观察所有后代节点的变动
            characterData: true, // 观察节点内容或文本的变动
            attributes: false,    // 观察属性的变动
            // attributeFilter: ['style', 'class'] // 只观察特定属性
        });


        this.insertDefaultParagraph();

        return this.element;
    }

    insertDefaultParagraph() {
        this.element.appendChild(document.createElement('p'));
    }

    insertCollapse() {
        let paragraphElement = this.context.selectionUtils.getSelectedParagraph(); 
        if(paragraphElement?.innerText.trim() === "") {
            paragraphElement.replaceWith(new EditorCollapse(this.context).onMount());
        } else {
            for(let child of this.element.children) {
                if(child === paragraphElement) {
                    child.after(new EditorCollapse(this.context).onMount());
                    break;
                }
            }
        }
    }

    onMounted(): void {
        throw new Error("Method not implemented.");
    }

    getElement(): HTMLElement {
        return this.element;
    }

}

class ContentBeforeMenu implements EditorComponent { 
    public readonly element: HTMLDivElement;
    public readonly context: YangEditor;
    public readonly sideMenu: EditorParagraphMenu;
    private target: HTMLElement | undefined;

    constructor(editor: YangEditor) {
        this.context = editor;
        this.element = document.createElement("div");
        this.sideMenu = new EditorParagraphMenu(this.context);
    }

    onMount(): HTMLElement {
        this.element.classList.add("yang-editor-content-before-menu");


        let button = document.createElement("button");
        button.classList.add("yang-editor-content-before-menu-button");

        this.element.onclick = () => this.sideMenu.show(this.target);
        this.element.onmouseenter = () => this.show(this.target);
        this.element.appendChild(button);
        this.element.appendChild(this.sideMenu.onMount());
        return this.element;
    }

    onMounted(): void {
        throw new Error("Method not implemented.");
    }

    getElement(): HTMLElement {
        return this.element;
    }

    show(target?: HTMLElement) {
        this.element.style.display = "flex";
        if(target !== this.target) {
            this.sideMenu.hide();
        }
        if(target) {
            this.target = target;
            this.element.style.left = `24px`;
            this.element.style.top = target.offsetTop + `px`;
        }
    }

    hide() {
        this.element.style.display = "none";
    }
}

class ButtonAdd implements EditorComponent {
    public readonly element: HTMLButtonElement;
    public readonly context: YangEditor;

    constructor(editor: YangEditor) {
        this.context = editor;
        this.element = document.createElement("button");
        this.element.innerText = "";
        this.element.style.width = "16px";
        this.element.style.height = "16px";
        this.element.style.height = "16px";
        this.element.style.backgroundImage = `url(${this.context.options.images.add})`;
        this.element.style.backgroundSize = "contain";
        this.element.style.backgroundRepeat = "no-repeat";
        this.element.style.cursor = "pointer";
        this.element.title = "Add Collapsed Panel";
        this.element.onclick = () => this.context.body.content.insertCollapse();

    }

    onMount(): HTMLElement {
        return this.element;
    }

    onMounted(): void {
        throw new Error("Method not implemented.");
    }

    getElement(): HTMLElement {
        return this.element;
    }

}

class ColorStrip implements EditorComponent {
    public readonly element: HTMLDivElement;
    public readonly context: YangEditor;
    public readonly colors: Array<string>;
    public readonly titles: Array<string>;

    constructor(editor: YangEditor) {
        this.context = editor;
        this.element = document.createElement("div");
        this.colors = ["rgba(228, 73, 91, 1)", "rgba(255, 140, 0, 1)", "rgba(255, 215, 0, 1)", "rgba(34, 139, 34, 1)", "rgba(30, 144, 255, 1)", "rgba(138, 43, 226, 1)", "rgba(255, 20, 147, 1)"];
        this.titles = ["red", "orange", "yellow", "green", "blue", "purple", "pink"];
    }

    onMount(): HTMLElement {
        this.element.classList.add("yang-editor-color-strip");
        this.element.style.display = "flex";
        this.element.style.alignItems = "center";
        for(let i = 0; i < this.colors.length; i++) {
            let color = this.colors[i];
            let title = this.titles[i];
            let btn = document.createElement("button");
            if(color != undefined && title != undefined) {
                btn.style.backgroundColor = color;
                btn.style.width = "16px";
                btn.style.height = "16px";
                btn.style.borderRadius = "2px";
                btn.style.cursor = "pointer";
                btn.title = title;
                btn.onclick = () => {
                    document.execCommand('foreColor', false, color);
                    this.context.selectionUtils.getSelectionRange()?.collapse();
                    // eqauls to: 
                    // document.execCommand('styleWithCSS', false, true);
                    // document.execCommand('foreColor', false, this.value);
                }
            } 
            this.element.appendChild(btn);
        }
        return this.element;
    }

    onMounted(): void {
        throw new Error("Method not implemented.");
    }

    getElement(): HTMLElement {
        return this.element;
    }
}

class IconButton implements EditorComponent {
    public readonly element: HTMLButtonElement;
    public readonly context: YangEditor;

    constructor(editor: YangEditor, icon: string, tooltip: string, onclick?:() => void) {
        this.context = editor;
        this.element = document.createElement("button");
        this.element.classList.add("yang-editor-icon-button");
        this.element.style.backgroundImage = `url(${icon})`;
        this.element.style.backgroundColor = "transparent";
        this.element.style.width = "26px";
        this.element.style.height = "26px";
        this.element.style.borderRadius = "3px";
        this.element.style.cursor = "pointer";
        this.element.style.backgroundSize = "16px 16px";
        this.element.style.backgroundRepeat = "no-repeat";
        this.element.style.backgroundPosition = "center center";
        this.element.title = tooltip;
        this.element.onclick = () => {
            if(onclick) {
                onclick();
            }
        };
        this.element.onmouseover = () => {
            this.element.style.backgroundColor = "rgba(231, 233, 232, 1)";
        };
        this.element.onmouseleave = () => {
            this.element.style.backgroundColor = "transparent";
        }

    }

    onMount(): HTMLElement {
        return this.element;
    }

    onMounted(): void {
        throw new Error("Method not implemented.");
    }

    getElement(): HTMLElement {
        return this.element;
    }
}

export class EditorToolbar implements EditorComponent {
    public readonly element: HTMLDivElement;
    public readonly context: YangEditor;

    constructor(editor: YangEditor) {
        this.context = editor;
        this.element = document.createElement("div");
    }

    onMount(): HTMLElement {
        this.element.classList.add("yang-editor-toolbar");
        this.element.appendChild(new ButtonAdd(this.context).onMount());
        this.element.appendChild(new ColorStrip(this.context).onMount());
        this.element.appendChild(new IconButton(this.context, this.context.options.images.bold, "Bold", this.boldSelection.bind(this)).onMount());
        this.element.appendChild(new IconButton(this.context, this.context.options.images.italic, "Italic", this.italicSelection.bind(this)).onMount());
        this.element.appendChild(new IconButton(this.context, this.context.options.images.underline, "Underline", this.underlineSelection.bind(this)).onMount());
        this.element.appendChild(new IconButton(this.context, this.context.options.images.deleteline, "Delete Line", this.strokeThroughSelection.bind(this)).onMount());
        this.element.appendChild(new IconButton(this.context, this.context.options.images.link, "Link", this.insertLink.bind(this)).onMount());
        this.element.appendChild(new IconButton(this.context, this.context.options.images.clear, "Clear", this.clearFormatSelection.bind(this)).onMount());
        return this.element;
    }

    onMounted(): void {
        throw new Error("Method not implemented.");
    }

    getElement(): HTMLElement {
        return this.element;
    }

    insertLink() {
        let range = this.context.selectionUtils.getSelectionRange();
        if (range == null || range.collapsed) {return;}
        const url = prompt("请输入链接地址");
        if (url) {
            const selectedContent = range.extractContents();
            const linkElement = document.createElement('a');
            linkElement.href = url;
            linkElement.appendChild(selectedContent);
            range.insertNode(linkElement);
        }
    }

    boldSelection() {

        // let range = this.context.selectionUtils.getSelectionRange();

        // if (range == null || range.collapsed) {return;}

        // // 检查是否已经在加粗标签内
        // let parentElement = range.commonAncestorContainer;
        // while (parentElement && parentElement.nodeType !== Node.ELEMENT_NODE && parentElement.parentElement !== null) {
        //     parentElement = parentElement.parentElement;
        // }

        // let tagName = parentElement.nodeName.toUpperCase();

        // if (parentElement && (tagName === 'STRONG' || tagName === 'B')) {
        //     // 如果已经在加粗标签内，则取消加粗
        //     if(parentElement.textContent != null && parentElement.parentNode !== null) {
        //         const textNode = document.createTextNode(parentElement.textContent);
        //         parentElement.parentNode.replaceChild(textNode, parentElement);
        //     }
        // } else {
        //     // 执行加粗
        //     //document.execCommand('bold', false);
        //     const selectedContent = range.extractContents();
        //     // 创建加粗元素并包裹选中内容
        //     const boldElement = document.createElement('strong');
        //     boldElement.appendChild(selectedContent);
        //     // 将加粗的内容插入回文档
        //     range.insertNode(boldElement);
        // }

        document.execCommand('bold', false, undefined);
    }


    italicSelection() {
        document.execCommand('italic', false, undefined);
    }

    underlineSelection() {
        document.execCommand('underline', false, undefined);
    }

    strokeThroughSelection() {
        document.execCommand('strikeThrough', false, undefined);
    }

    clearFormatSelection() {
        document.execCommand('removeFormat', false, undefined);
        document.execCommand('unlink', false, undefined);
    }

}

export class EditorCollapse implements EditorComponent {
    public readonly element: HTMLDivElement;
    public readonly context: YangEditor;
    title: HTMLDivElement;
    header: HTMLDivElement;
    button: HTMLButtonElement;
    body: HTMLDivElement;
    container: HTMLDivElement;

    collapsed: boolean = false;

    constructor(editor: YangEditor) {
        this.context = editor;
        this.element = document.createElement("div");
        this.container = document.createElement('div');
        this.header = document.createElement('div');
        this.body = document.createElement('div');
        this.button = document.createElement('button');
        this.title = document.createElement('div');

    }

    getElement(): HTMLElement {
        return this.element;
    }

    onMount(): HTMLElement {

        let container = this.container;
        let header = this.header;
        let body = this.body;
        let button = this.button;
        let title = this.title;

        container.classList.add("yang-editor-collapse-container");
        header.classList.add("yang-editor-collapse-header");
        body.classList.add("yang-editor-collapse-body");
        button.classList.add("yang-editor-collapse-button");
        title.classList.add("yang-editor-collapse-title");
        title.innerText = "折叠面板标题";
        
        button.innerText = "";

        header.appendChild(button);
        header.appendChild(title);
        container.appendChild(header);
        container.appendChild(body);
        this.element.appendChild(container);

        container.contentEditable = "false";
        title.contentEditable = "true";
        body.contentEditable = "true";
        

        button.style.width = "20px";
        button.style.height = "20px";
        button.style.backgroundImage = `url(${this.context.options.images.down})`;
        button.style.backgroundSize = "16px 16px";
        button.style.backgroundRepeat = "no-repeat";
        button.style.backgroundPosition = "center";
        button.style.cursor = "pointer";
        button.style.borderRadius = "3px"
        button.onclick = () => {
            this.collapsed = !this.collapsed;
            this.renderState();
        }

        this.renderState();
        return this.getElement();
    }

    renderState() {
        if(this.collapsed) {
            this.button.classList.add("collapsed");
            this.body.classList.add("collapsed");
            this.header.classList.add("collapsed");
        } else {
            this.button.classList.remove("collapsed");
            this.body.classList.remove("collapsed");
            this.header.classList.remove("collapsed");
        }
    }

    onMounted(): void {
        throw new Error("Method not implemented.");
    }

}

export class EditorParagraphMenu implements EditorComponent {
    public readonly element: HTMLDivElement;
    public readonly context: YangEditor;
    private target: HTMLElement | undefined;

    constructor(editor: YangEditor) {
        this.context = editor;
        this.element = document.createElement("div");
    }

    onMounted(): void {
        throw new Error("Method not implemented.");
    }

    getElement(): HTMLElement {
        return this.element;
    }

    onMount(): HTMLElement {
        this.element.classList.add("yang-editor-paragraph-menu");
        let ul = document.createElement("ul");
        let lis = new Array<HTMLLIElement>();
        let images = [this.context.options.images.delete, this.context.options.images.copy, this.context.options.images.cut];
        let texts = ["Delete", "Copy", "Cut"];

        for(let i = 0; i < images.length; i++) {
            let li = document.createElement("li");
            let icon = document.createElement("button");
            let text = document.createElement("p");
            li.classList.add("yang-editor-paragraph-menu-item");
            icon.classList.add("yang-editor-paragraph-menu-item-icon");
            text.classList.add("yang-editor-paragraph-menu-item-text");
            let title = texts[i];
            if(title !== undefined) {
                icon.style.backgroundImage = `url(${images[i]})`;
                icon.style.backgroundSize = "16px 16px";
                icon.style.backgroundRepeat = "no-repeat";
                icon.style.backgroundPosition = "center";
                icon.style.width = "20px";
                icon.style.height = "20px";
                icon.style.cursor = "pointer";
                icon.style.border = "none";
                icon.style.outline = "none";
                li.style.display = "flex";
                li.style.alignItems = "center";
                text.innerText = title;
                li.appendChild(icon);
                li.appendChild(text);
            }
            ul.appendChild(li);
            lis.push(li);
        }

        if (lis[0]) {
            lis[0].onclick = this.delete.bind(this);
        }

        this.element.onmouseleave = this.hide.bind(this);

        this.element.appendChild(ul);
        return this.getElement();
    }


    hide() {
        this.element.style.display = "none";
    }

    show(target?: HTMLElement) {
        this.element.style.display = "block";
        if(target) {
            this.target = target;
        }
    }

    delete(ev: MouseEvent) {
        if(this.target !== undefined) {
            this.target.remove();
            this.hide();
            ev.stopPropagation();
        }
    }
}

export class EditorParagraph implements EditorComponent {
    public  element: HTMLParagraphElement;
    public  text: HTMLDivElement | undefined;
    private enterCount: number = 0;
    private str: string = ""
    private focus: boolean = false;
    private focusTail: boolean = false;

    constructor(str?: string, focus?: boolean) {
        this.element = document.createElement("p");
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
        this.element.classList.add("yang-editor-paragraph");
        this.element.contentEditable = "false";
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
        this.element.appendChild(text);

        let deleteButton = document.createElement("button");
        deleteButton.classList.add("yang-editor-paragraph-delete");
        deleteButton.innerText = "Delete";
        // deleteButton.onclick = () => {globalEventCenter.emit<DeleteParagraphData>(Constants.EV_DELETE_PARAGRAPH, {
        //     sourceComponent: this,
        // })};
        this.element.appendChild(deleteButton);

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
                    // globalEventCenter.emit<DeleteParagraphData>(Constants.EV_DELETE_PARAGRAPH, {
                    //     sourceComponent: this,
                    // })
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

                            // globalEventCenter.emit<SplitParagraphData>(Constants.EV_SPLIT_PARAGRAPH, {
                            //     sourceComponent: this,
                            //     leftText: leftString,
                            //     rightText: rightString,
                            // });
                        }

                    }
                }
            } else {
                this.enterCount = 0;
            }

        });
        text.classList.add("yang-editor-paragraph-text");
        text.contentEditable = "true";

        this.text = text;
        return this.element;
    }

    getElement(): HTMLElement  {
        return this.element;
    }
}

