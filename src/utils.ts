import { EditorContent } from "./componets";

export class SelectionUtils {

    private element: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    public getSelectedParagraph(): HTMLElement | null {
        let range = this.getSelectionRange();
        if(range) {
            let node = range.startContainer;
            while(node && node !== this.element) {
                if(node.nodeType === Node.ELEMENT_NODE) {
                    let elem = node as HTMLElement;
                    if(elem.classList.contains(EditorContent.PARAGRAPH_STYLE)) {
                        return elem;
                    }
                }
                node = node.parentNode as Node;
            }
        }
        return null;
    }

    public getSelectionRange(): Range | null {
        let selection = window.getSelection();
        if(selection && selection.rangeCount > 0) {
            let range = selection.getRangeAt(0);
            if(this.element.contains(range.commonAncestorContainer)) {
                return range;
            }
        }
        return null;
    }
}