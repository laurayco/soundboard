import * as models from "./models";
import { openDb, UpgradeDB, DB } from "idb";
import * as React from "react";

export default class DatabaseManager {
    static database_name = "SoundMixer";
    static database_version = 1;

    supported_storage_methods: models.StorageMethods[];
    database: DB;
    is_initialized = false;

    constructor() {
        this.supported_storage_methods = ([
            "url",
            "blob",
            "arraybuffer",
            "base64",
            "filename"
        ] as models.StorageMethods[]).filter(this.supports_storage_method);
        this.supported_storage_methods.sort(this.sort_storage_methods);
    }

    sort_storage_methods(a: models.StorageMethods,b: models.StorageMethods) : number {
        const order_of_preference: models.StorageMethods[] = [
            "url",
            "blob",
            "arraybuffer",
            "filename",
            "base64"
        ];
        return order_of_preference.indexOf(a) - order_of_preference.indexOf(b);
    }

    supports_storage_method(method: models.StorageMethods): boolean {
        return true;
    }

    async init() {
        this.database = await openDb(
            DatabaseManager.database_name,
            DatabaseManager.database_version,
            this.upgrade_database
        );
        this.is_initialized = true;
    }

    upgrade_database(upgrade: UpgradeDB) {
        switch(upgrade.oldVersion) {
            case 0:
                console.log("Initializing database for the first time!");
                const opts : IDBObjectStoreParameters = {
                    keyPath: "id",
                    autoIncrement: true
                };
                const boards_store = upgrade.createObjectStore("boards", opts);
                boards_store.createIndex("slug","slug", {
                    unique: true
                });

                const sounds_store = upgrade.createObjectStore("soundbytes", opts);
                sounds_store.createIndex("boards","boards", {
                    // you can have the same boards on a soundbyte
                    unique: false,
                    // you can have more than one board per soundbyte.
                    multiEntry: true
                });
                sounds_store.createIndex("last_modified","last_modified",{unique: false});
                sounds_store.createIndex("created","created",{unique: false});

                const data_store = upgrade.createObjectStore("data", opts);

        }
    }

    async requires_init() {
        if(!this.is_initialized) {
            await this.init();
        }
    }

    async delete_document(store: string, id: number) : Promise<void> {
        await this.requires_init();
        const transaction = this.database.transaction(store, "readwrite");
        transaction.objectStore(store).delete(id);
        return transaction.complete;
    }

    async write_document<T extends models.StandardObject>(store: string, document: T) : Promise<number> {
        await this.requires_init();
        const transaction = this.database.transaction(store, "readwrite");
        const result = await transaction.objectStore(store).put(document);
        await transaction.complete;
        return result as number;
    }

    async get_document<T extends models.StandardObject>(store: string,id: number): Promise<T> {
        await this.requires_init();
        const transaction = this.database.transaction(store,"readonly");
        const result = await transaction.objectStore(store).get(id) as T;
        return result;
    }

    async get_all_documents<T extends models.StandardObject>(store: string): Promise<T[]> {
        await this.requires_init();
        const transaction = this.database.transaction(store, "readonly");
        const result = await transaction.objectStore(store).getAll() as T[];
        return result;
    }

    async get_all_boards() : Promise<models.Board[]> {
        return this.get_all_documents<models.Board>("boards");
    }

    async get_board(id: number) : Promise<models.Board> {
        return this.get_document<models.Board>("boards",id);
    }

    async get_board_by_slug(slug: string): Promise<models.Board> {
        await this.requires_init();
        const transaction = this.database.transaction("boards","readonly");
        const store = transaction.objectStore("boards");
        const results = [] as models.Board[];
        const index = store.index("slug");
        return index.get(slug) as Promise<models.Board>;
    }

    async get_board_soundbytes(id: number) : Promise<models.SoundByte[]> {
        await this.requires_init();
        const transaction = this.database.transaction("soundbytes","readonly");
        const store = transaction.objectStore("soundbytes");
        const results = await store.index("boards").getAll(IDBKeyRange.only(id)) as models.SoundByte[];
        return results;
    }

    async get_all_soundbytes() : Promise<models.SoundByte[]> {
        return this.get_all_documents<models.SoundByte>("soundbytes");
    }

    async get_soundbyte(id: number) : Promise<models.SoundByte> {
        return this.get_document<models.SoundByte>("soundbytes", id);
    }

    async get_all_data() : Promise<models.DataHolder[]> {
        return this.get_all_documents<models.DataHolder>("data")
    }

    async get_data(id: number) : Promise<models.DataHolder> {
        return this.get_document("data",id);
    }

    create_standard_object() : models.StandardObject {
        return {
            created: new Date(),
            last_modified: new Date()
        };
    }

    create_slug(text: string) : string {
        return encodeURIComponent(text.toLowerCase().replace(/\s+/g,"_"));
    }

    async create_board(name: string) : Promise<models.Board> {
        const slug = this.create_slug(name);
        const so = this.create_standard_object();
        const data = Object.assign(so,{
            name,
            slug
        }) as models.Board;
        const id = await this.write_document("boards", data);
        data.id = id;
        return data;
    }

    async determine_length(source: models.SourceInformation, extra: any) : Promise<number> {
        /*
            to-do: return (in seconds) the length of the audio clip specified by
                the audio source specified by source / extra.
        */
        return 0;
    }

    async prepare_source(source: models.SourceInformation, source_extra: any): Promise<models.SourceInformation> {
        /*
            to-do:
                store the information pointed to by source / source_extra.
                in the case of file 'uploads', convert to blobs, then filenames, then base64.
                in the case of urls, nothing needs to be done.
                if a conversion does take place, create a DataHolder item,
                get the id and set it as the document_id property of source.
                if the source extra is a url or filename instead,
                set the appropriate field.
        */
        return source;
    }

    async create_soundbyte(name: string,source: models.SourceInformation, boards: number[],source_extra: any) : Promise<models.SoundByte> {
        source = await this.prepare_source(source, source_extra);
        const length = await this.determine_length(source,source_extra);
        const so = this.create_standard_object();
        const data = Object.assign(so,{
            length,
            name,
            data: source,
            boards
        }) as models.SoundByte;
        const id = await this.write_document("soundbytes", data);
        data.id = id;
        return data;
    }

}

export const Context = React.createContext<DatabaseManager>(new DatabaseManager());