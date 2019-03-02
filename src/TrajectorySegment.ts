import {LatLngLiteral} from "leaflet";

export class TrajectorySegment {
    readonly segmentId: String;
    readonly points: LatLngLiteral[];

    constructor(segmentId: String, points: LatLngLiteral[] = []) {
        this.segmentId = segmentId;
        this.points = points;
    }
}