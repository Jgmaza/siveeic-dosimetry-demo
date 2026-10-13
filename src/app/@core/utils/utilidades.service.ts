import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UtilidadesService {

    userArray: any[];
    jsonArray: any[];

    constructor() {
    }

    getSumArray(array): any {
        let sum = 0;
        array.forEach(element => {
            sum += element;
        });
        return sum;
    }

    public translateTree(tree: any) {
        const trans = tree.map((n: any) => {
            let node = {};
            node = {
                id: n.Id,
                name: n.Nombre,
            }
            if (n.hasOwnProperty('Opciones')) {
                if (n.Opciones !== null) {
                    const children = this.translateTree(n.Opciones);
                    node = { ...node, ...{ children: children } };
                }
                return node;
            } else {
                return node;
            }
        });
        return trans;
    }

    public filterTreePermission(tree: any, user: number) {
       // console.info(tree)
        const trans = tree.filter((n: any) => {
            let node = {};
            if (n.hasOwnProperty('Opciones')) {
                if (n.Opciones !== null) {
                    const children = this.filterTreePermission(n.Opciones, user);
                    node = { ...node, ...{ Opciones: children } };
                }
                return (n.permisos.indexOf(user) !== -1);
            } else {
                return (n.permisos.indexOf(user) !== -1);
            }
        });
        return trans;
    }

    public formatDate(value: string | number | Date): string {
        if (value === null || value === undefined || value === '' || value === 'NR' || String(value).toLowerCase() === 'no reporta') {
            return 'NR';
        }
        if (value === 'NP' || String(value).toUpperCase() === 'NP') {
            return 'NR';
        }

        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) {
            return 'NR';
        }

        const day = String(date.getUTCDate()).padStart(2, '0');
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const month = months[date.getUTCMonth()];
        const year = date.getUTCFullYear();

        return `${day}-${month}-${year}`;
    }

    public formatString(value: string): string {
        if (value === null || value === undefined || value === '' || value === 'NR' || String(value).toLowerCase() === 'no reporta') {
            return 'NR';
        }
        if (value === 'NP' || String(value).toUpperCase() === 'NP') {
            return 'NR';
        }
        return value;
    }

    /**
     * Totales / Hp acumulado: 0 → 0,00 (nunca ND).
     * Códigos NP/ND/DNL/NR se respetan si vienen explícitos.
     */
    public formatNumber(value: string | number): string {
        if (value === null || value === undefined || value === '' || value === 'NR' || String(value).toLowerCase() === 'no reporta') {
            return 'NR';
        }

        const up = String(value).trim().toUpperCase();
        if (up === 'NP' || up === 'ND' || up === 'DNL') {
            return up;
        }

        const number = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
        if (isNaN(number)) {
            return 'NR';
        }
        return number.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    /**
     * Dosis mensuales (contrato área 24-sep):
     * vacío → NR; 0 → ND; NP/ND/DNL/NR explícitos se respetan.
     */
    public formatDosisMes(value: string | number): string {
        if (value === null || value === undefined || value === '' || value === 'NR' || String(value).toLowerCase() === 'no reporta') {
            return 'NR';
        }

        const up = String(value).trim().toUpperCase();
        if (up === 'N/A' || up === 'NA') {
            return 'NR';
        }
        if (up === 'NP' || up === 'ND' || up === 'DNL') {
            return up;
        }

        const number = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
        if (isNaN(number)) {
            return 'NR';
        }
        if (number === 0) {
            return 'ND';
        }
        return number.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

}
