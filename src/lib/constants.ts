
export const API_URL = "https://script.google.com/macros/s/AKfycbz7NcHW3fDUa9-Z23f6GwScdpXVifeP1dxOk8Ipg9i9Ft1sjci4Buk6F6C4loOD6iOX/exec";
export const TOKEN = "MI_TOKEN_SEGURO";

export const MESES_ES = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

export const PLANES = ["1M", "2M", "3M", "4M", "5M", "10M", "20M", "100M", "250M"];
export const NODOS = ["BENJAMIN", "MIRAMONTES", "SANTAFE", "BYZA", "PRIO", "PANAM", "CALLE 16", "URBINA", "RUMICHACA", "FIBRA"];
export const ESTADOS = ["ACTIVO", "ACTIVO CABLE", "ACTIVO 2", "INACTIVO"];
export const TV_BOX_OPTS = ["SI", "NO"];
export const VALORES_CUOTA = [20000, 25000, 30000, 35000, 40000, 50000, 55000, 60000, 90000, 100000, 120000];

export function getMesActualEs() {
    return MESES_ES[new Date().getMonth()];
}
