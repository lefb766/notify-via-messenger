declare module 'deed' {
    import { IncomingMessage } from 'http';

    interface Deed {
        (secret: string, req: IncomingMessage, cb: Function): IncomingMessage
    }

    var deed: Deed;
    export = deed;
}
