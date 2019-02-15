export interface StandardObject {
    // datetime strings
    id?: number;
    last_modified: Date;
    created: Date;
}

export type StorageMethods = "url" | "blob" | "arraybuffer" | "base64" | "filename";

export interface SourceInformation {
    kind: StorageMethods;
}

export interface ExternalWebSource extends SourceInformation {
    kind: "url";
    url: string;
}

export interface ExternalFileSource extends SourceInformation {
    kind: "filename";
    filename: string;
}

export interface DBSource extends SourceInformation {
    kind: "blob" | "arraybuffer" | "base64";
    document_id: number;
}

export interface ArrayBufferSource extends DBSource {
    kind: "arraybuffer";
}

export interface StringSource extends DBSource {
    kind: "base64";
}

export interface BlobSource extends DBSource {
    kind: "blob";
}

export interface SoundByte extends StandardObject {
    length: number;// in seconds
    data: SourceInformation;
    name: string;
    boards: number[];// ids to Board objects.
}

export interface Board extends StandardObject {
    name: string;
    slug: string;
}

export interface DataHolder extends StandardObject {
    format: StorageMethods;
    content: any;
}