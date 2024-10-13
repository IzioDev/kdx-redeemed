export class KaswareNotInstalledError extends Error {
    constructor() {
        super()
        super.message = "Kasware Not Installed"
        super.name = KaswareNotInstalledError.name
    }
}