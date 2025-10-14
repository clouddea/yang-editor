import {EditorComponent} from "./componets";

export class Constants {

    static readonly EV_INSERT_PARAGRAPH = "yang-editor-insert-paragraph";

    static readonly EV_SPLIT_PARAGRAPH = "yang-editor-split-paragraph";


    static readonly EV_DELETE_PARAGRAPH = "yang-editor-delete-paragraph";

}

export interface SplitParagraphData {
    sourceComponent: EditorComponent;
    leftText: string;
    rightText: string;
}

export interface DeleteParagraphData {
    sourceComponent: EditorComponent;
}


