import { ComponentFactory } from "./componets";

export class SelectionUtils {

    private readonly element: HTMLElement;

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
                    if(elem.classList.contains(ComponentFactory.PARAGRAPH_STYLE)) {
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

/**
 * utils for format cleaning
 */
export class FormatCleaner {

    private static unwantedTags = ['style', 'script', 'link', 'meta', 'head', 'title', 'xml'];
    
    /**
     * clean HTML string and return plain text
     * @param htmlString html string
     * @returns plain text
     */
    static cleanHTMLString(htmlString: string): string {
        // remove Word XML namespace labels
        htmlString = htmlString.replace(/<\/?[ovwm]:[^>]*>/gi, '');
        
        // remove Word conditional comments
        htmlString = htmlString.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '');
        htmlString = htmlString.replace(/<!--[\s\S]*?-->/g, '');
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        
        // remove all <style> tags (including @page, @font-face rules)
        const styleTags = tempDiv.querySelectorAll('style');
        styleTags.forEach(style => style.remove());
        
        // remove other unwanted tags
        FormatCleaner.unwantedTags.forEach(tag => {
            const elements = tempDiv.querySelectorAll(tag);
            elements.forEach(el => el.remove());
        });
        
        return this.extractPlainText(tempDiv);
    }
    
    /**
     * extract plain text from node, remove all HTML tags and styles
     * @param node DOM node
     * @returns plain text content
     */
    static extractPlainText(node: Node): string {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || '';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const tagName = element.tagName.toLowerCase();
            if (FormatCleaner.unwantedTags.includes(tagName)) {
                return '';
            }
            if (tagName === 'br') {
                return '\n';
            }
            // block elements（p、div etc.）
            const isBlock = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                            'li', 'tr', 'td', 'th', 'blockquote', 'pre'].includes(tagName);
            let result = '';
            for (let child of Array.from(element.childNodes)) {
                result += this.extractPlainText(child);
            }
            if (isBlock && result.trim()) {
                result += '\n';
            }
            return result;
        }
        return '';
    }
    
    /**
     * remove all styles and other properties
     * @param element HTML element
     */
    static removeAllStyles(element: HTMLElement): void {
        // remove style attribute
        element.removeAttribute('style');
        
        // remove common format attributes
        const formatAttributes = ['class', 'align', 'valign', 'bgcolor', 'color', 
                                 'face', 'size', 'width', 'height', 'border', 
                                 'cellpadding', 'cellspacing', 'dir'];
        
        formatAttributes.forEach(attr => {
            if (element.hasAttribute(attr)) {
                element.removeAttribute(attr);
            }
        });
        
        // recursively process child elements
        for (let child of Array.from(element.children)) {
            this.removeAllStyles(child as HTMLElement);
        }
    }
}