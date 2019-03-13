import {LatLngLiteral} from "leaflet";

export class PointData implements LatLngLiteral{
    readonly lat: number;
    readonly lng: number;
    readonly csvRow: any;

    constructor(lat: number, lng: number, csvRow: any) {
        this.lat = lat;
        this.lng = lng;
        this.csvRow = csvRow;
    }
}
