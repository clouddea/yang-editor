import { images } from "./images";
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

    constructor(editor: YangEditor) {
        this.element = document.createElement("div");
        this.context = editor;
    }

    onMount(): HTMLElement {
        this.element.classList.add("yang-editor-content");
        if(this.context.options.mode === "edit") {
            this.element.contentEditable = "true";
        }

        const observer = new MutationObserver((mutations) => {
            if (this.context.options.events.onContentChange) {
                this.context.options.events.onContentChange(this.element.innerHTML);
            }
            let childNodes = this.element.childNodes;
            // transform text nodes or non-paragraph elements to paragraphs
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
            let lastElement = this.element.children[this.element.children.length - 1];
            if (lastElement === undefined || lastElement.childNodes.length > 0) {
                this.insertDefaultParagraph();
            }

            // tag every childnodes
            for(let node of this.element.children) {
                if(node.nodeType === Node.ELEMENT_NODE) {
                    let elem = node as HTMLElement;
                    if(!elem.classList.contains(ComponentFactory.PARAGRAPH_STYLE)) {
                        elem.classList.add(ComponentFactory.PARAGRAPH_STYLE);
                    }
                }
            }

            // add mousemove and mouseleave event to every child nodes
            for(let node of this.element.children) {
                if(node.nodeType === Node.ELEMENT_NODE) {
                    if(this.context.options.mode === "edit") {
                        let elem = node as HTMLElement;
                        elem.onmousemove = () => {
                            this.context.body.menuButton.show(elem);
                        };
                        elem.onmouseleave = () => {
                            this.context.body.menuButton.hide();
                        };
                    }
                }
            }

            // activate all components
            for(let node of this.element.children) {
                if(node.nodeType === Node.ELEMENT_NODE) {
                    for (let className of node.classList) {
                        if (ComponentFactory.STYLES.indexOf(className) !== -1) {
                            this.context.componentFactory.createComponent(className, node as HTMLElement).onMount();
                            break;
                        }
                    }
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

        this.element.oncopy = (e) => {
            // TODO: handle copy event
            // e.preventDefault();
            // let selection = window.getSelection();
            // if (selection) {
            //     let range = selection.getRangeAt(0);
            //     let cloned = range.cloneContents();
            //     // console.log(cloned);
            //     // console.log(e.clipboardData)
            //     // console.log(e.clipboardData?.getData("text/html"));
            //     // e.clipboardData?.setData("text/html", cloned.innerHTML);
            // }
        }

        this.element.onpaste = (e) => {
            // TODO: handle paste event
            //e.preventDefault();
            // let clipboardData = e.clipboardData;
            // if (clipboardData) {
            //     let html = clipboardData.getData("text/html");
            //     let text = clipboardData.getData("text/plain");
            //     if (html) {
            //         let div = document.createElement("div");
            //         div.innerHTML = html;
            //         this.element.appendChild(div);
            //     } else if (text) {
            //         this.element.appendChild(document.createTextNode(text));
            //     }
            // }
        }

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
        button.style.backgroundImage = `url("${images.menu2}")`;

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
        this.element.style.backgroundImage = `url("${images.add2x}")`;
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

class BackGroundColorStrip implements EditorComponent {
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
                    document.execCommand('backColor', false, color);
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

class ForeGroundColorStrip implements EditorComponent {
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
        this.element.classList.add("yang-editor-fgcolor-strip");
        this.element.style.display = "flex";
        this.element.style.alignItems = "center";
        for(let i = 0; i < this.colors.length; i++) {
            let color = this.colors[i];
            let title = this.titles[i];
            let btn = document.createElement("button");
            if(color != undefined && title != undefined) {
                // btn.style.backgroundColor = "transparent";
                // btn.style.backgroundImage = `url(${this.context.options.images.fgColor})`;
                // btn.style.backgroundSize = "16px 16px";
                // btn.style.backgroundRepeat = "no-repeat";
                // btn.style.backgroundPosition = "center";
                btn.style.mask = `url("${images.fgcolor}") no-repeat center`;
                btn.style.webkitMask = `url("${images.fgcolor}") no-repeat center`;
                btn.style.backgroundColor = color;
                btn.style.width = "17px";
                btn.style.height = "17px";
                btn.style.borderRadius = "2px";
                btn.style.cursor = "pointer";
                btn.title = title;
                btn.onclick = () => {
                    document.execCommand('foreColor', false, color);
                    this.context.selectionUtils.getSelectionRange()?.collapse();
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
        this.element.appendChild(new BackGroundColorStrip(this.context).onMount());
        this.element.appendChild(new ForeGroundColorStrip(this.context).onMount());
        this.element.appendChild(new IconButton(this.context, images.bold2x, "Bold", this.boldSelection.bind(this)).onMount());
        this.element.appendChild(new IconButton(this.context, images.italic2x, "Italic", this.italicSelection.bind(this)).onMount());
        this.element.appendChild(new IconButton(this.context, images.underline2x, "Underline", this.underlineSelection.bind(this)).onMount());
        this.element.appendChild(new IconButton(this.context, images.deleteline2x, "Delete Line", this.strokeThroughSelection.bind(this)).onMount());
        this.element.appendChild(new IconButton(this.context, images.link2x, "Link", this.insertLink.bind(this)).onMount());
        this.element.appendChild(new IconButton(this.context, images.clear2x, "Clear", this.clearFormatSelection.bind(this)).onMount());
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

    public static readonly COLLAPSE_STYLE = "collapsed";
    public readonly element: HTMLElement;
    public readonly context: YangEditor;
    title: HTMLDivElement;
    header: HTMLDivElement;
    button: HTMLButtonElement;
    body: HTMLDivElement;
    container: HTMLDivElement;

    constructor(editor: YangEditor, element?: HTMLElement) {
        this.context = editor;
        if(element) {
            this.element = element;
            this.container = element.querySelector('.yang-editor-collapse-container') as HTMLDivElement;
            this.header = element.querySelector('.yang-editor-collapse-header') as HTMLDivElement;
            this.body = element.querySelector('.yang-editor-collapse-body') as HTMLDivElement;
            this.button = element.querySelector('.yang-editor-collapse-button') as HTMLButtonElement;
            this.title = element.querySelector('.yang-editor-collapse-title') as HTMLDivElement;
        } else {
            this.element = document.createElement("div");
            this.container = document.createElement('div');
            this.header = document.createElement('div');
            this.body = document.createElement('div');
            this.button = document.createElement('button');
            this.title = document.createElement('div');

            this.element.classList.add(ComponentFactory.COLLAPSE_STYLE)
            this.container.classList.add("yang-editor-collapse-container");
            this.header.classList.add("yang-editor-collapse-header");
            this.body.classList.add("yang-editor-collapse-body");
            this.button.classList.add("yang-editor-collapse-button");
            this.title.classList.add("yang-editor-collapse-title");
            this.title.innerText = "折叠面板标题";

            this.button.innerText = "";

            this.header.appendChild(this.button);
            this.header.appendChild(this.title);
            this.container.appendChild(this.header);
            this.container.appendChild(this.body);
            this.element.appendChild(this.container);

            this.container.contentEditable = "false";
            this.button.style.backgroundImage = `url("${images.down2x}")`;
        }
    }

    getElement(): HTMLElement {
        return this.element;
    }

    onMount(): HTMLElement {
        if(this.context.options.mode === "edit") {
            this.title.contentEditable = "true";
            this.body.contentEditable = "true";
        } else {
            this.title.contentEditable = "false";
            this.body.contentEditable = "false";
        }
        this.button.onclick = () => {
            this.switchState();
            this.renderState();
        }
        this.renderState();
        return this.getElement();
    }

    switchState() {
        if(this.element.classList.contains(EditorCollapse.COLLAPSE_STYLE)) {
            this.element.classList.remove(EditorCollapse.COLLAPSE_STYLE)
        } else {
            this.element.classList.add(EditorCollapse.COLLAPSE_STYLE);
        }
    }

    isCollapsed() {
        return this.element.classList.contains(EditorCollapse.COLLAPSE_STYLE);
    }

    renderState() {
        if(this.isCollapsed()) {
            this.button.classList.add(EditorCollapse.COLLAPSE_STYLE);
            this.body.classList.add(EditorCollapse.COLLAPSE_STYLE);
            this.header.classList.add(EditorCollapse.COLLAPSE_STYLE);
        } else {
            this.button.classList.remove(EditorCollapse.COLLAPSE_STYLE);
            this.body.classList.remove(EditorCollapse.COLLAPSE_STYLE);
            this.header.classList.remove(EditorCollapse.COLLAPSE_STYLE);
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
        let icons = [images.deleteline2x, images.copy2x, images.cut2x];
        let texts = ["Delete", "Copy", "Cut"];

        for(let i = 0; i < icons.length; i++) {
            let li = document.createElement("li");
            let icon = document.createElement("button");
            let text = document.createElement("p");
            li.classList.add("yang-editor-paragraph-menu-item");
            icon.classList.add("yang-editor-paragraph-menu-item-icon");
            text.classList.add("yang-editor-paragraph-menu-item-text");
            let title = texts[i];
            if(title !== undefined) {
                icon.style.backgroundImage = `url("${icons[i]}")`;
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

        if (lis[1]) {
            lis[1].onclick =  this.copy.bind(this);
        }

        if (lis[2]) {
            lis[2].onclick = this.cut.bind(this);
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

    copy(ev: MouseEvent) {
        if(this.target !== undefined) {
            navigator.clipboard.write([new ClipboardItem({
                "text/html": this.target.outerHTML
            })]).then(() => {
                this.hide();
            });
        }
    }

    cut(ev: MouseEvent) {
        if(this.target !== undefined) {
            navigator.clipboard.write([new ClipboardItem({
                "text/html": this.target.outerHTML
            })]).then(() => {
                this.target?.remove();
                this.hide();
            });
        }
    }
}

export class EditorParagraph implements EditorComponent {
    public context: YangEditor;
    public element: HTMLElement;

    constructor(context: YangEditor, element?: HTMLElement) {

        this.context = context;
        if (element !== undefined) {
            this.element = element;
        } else {
            this.element = document.createElement("p");
            this.element.classList.add(ComponentFactory.PARAGRAPH_STYLE);
        }
    }

    onMounted(): void {
        throw new Error("Method not implemented.");
    }

    onMount() : HTMLElement {
        return this.element;
    }

    getElement(): HTMLElement  {
        return this.element;
    }
}


export class ComponentFactory {

    static PARAGRAPH_STYLE = "yang-editor-paragraph";
    static COLLAPSE_STYLE = "yang-editor-collapse";
    static STYLES = [this.PARAGRAPH_STYLE, this.COLLAPSE_STYLE];

    private context: YangEditor;

    constructor(context: YangEditor) {
        this.context = context;
    }

    createComponent(typeClassName: string, element?: HTMLElement): EditorComponent {
        switch (typeClassName) {
            case ComponentFactory.PARAGRAPH_STYLE:
                return new EditorParagraph(this.context, element);
            case ComponentFactory.COLLAPSE_STYLE:
                return new EditorCollapse(this.context, element);
            default:
                throw new Error(`Unknown component type: ${typeClassName}`);
        }
    }

}
