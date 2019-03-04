import {CsvData} from '../csvLoader';
import {Map as LMap} from 'leaflet';
import {TrajectorySegment} from '../TrajectorySegment';
import {PointData} from '../PointData';
import {SegmentsMapLayer} from './SegmentsMapLayer';
import {GPSMapLayer} from './GPSMapLayer';


export function createMapLayer(csvResult: CsvData, sourceName: string, map: LMap) {
    const headersSet = new Set(csvResult.fields);
    if (!headersSet.has('lat') || !headersSet.has('lat')) {
        throw new Error(`Unsupported format: ${csvResult.fields.join(', ')}`);
    }

    // Segments mode
    if (headersSet.has('segment_id')) {
        const segments: TrajectorySegment[] = csvResult.data.reduce(
            (acc: TrajectorySegment[], row) => {
                const coord = new PointData(parseFloat(row.lat), parseFloat(row.lon), row);
                if (acc.length < 1 || acc[acc.length - 1].segmentId != row.segment_id) {
                    acc.push(new TrajectorySegment(row.segment_id));
                }
                acc[acc.length - 1].coords.push(coord);
                return acc;
            },
            []);
        return new SegmentsMapLayer(sourceName, segments, csvResult.fields, map);
    }

    // GPS mode
    const coords = csvResult.data
        .map(row => new PointData(parseFloat(row.lat), parseFloat(row.lon), row));
    return new GPSMapLayer(sourceName, coords, csvResult.fields, map);
}