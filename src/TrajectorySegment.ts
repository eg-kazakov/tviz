import {PointData} from './PointData';

export class TrajectorySegment {
    readonly segmentId: string;
    readonly coords: PointData[];

    constructor(segmentId: string, coords: PointData[] = []) {
        this.segmentId = segmentId;
        this.coords = coords;
    }
}
