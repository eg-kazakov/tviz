import {LatLngLiteral} from 'leaflet';

export class PointData implements LatLngLiteral {
    readonly lat: number;
    readonly lng: number;
    readonly csvRow: {[key: string]: string};

    constructor(lat: number, lng: number, csvRow: {[key: string]: string}) {
        this.lat = lat;
        this.lng = lng;
        this.csvRow = csvRow;
    }
}
