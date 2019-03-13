import {CsvData} from '../csvLoader';
import {Map as LMap} from 'leaflet';
import {TrajectorySegment} from '../TrajectorySegment';
import {PointData} from '../PointData';
import {SegmentsMapLayer} from './SegmentsMapLayer';
import {GPSMapLayer} from './GPSMapLayer';
import {IMapLayer} from './MapLayerBase';


export function createMapLayer(csvResult: CsvData, sourceName: string, map: LMap): IMapLayer {
    const inputColsSet = new Set(csvResult.fields);

    const latitudeColNames = ['lat', 'latitude'];
    const latitudeColName = latitudeColNames.find(latName => inputColsSet.has(latName)) || null;

    const longitudeColNames = ['lng', 'lon', 'long', 'longitude'];
    const longitudeColName = longitudeColNames.find(lngName => inputColsSet.has(lngName)) || null;

    const segmentColNames = ['segment_id'];
    const segmentColName = segmentColNames.find(segName => inputColsSet.has(segName)) || null;

    const chunkColNames = ['trip_id', 'trajectory_id', 'probe', 'probe_id'];
    const chunkColName = chunkColNames.find(chunkName => inputColsSet.has(chunkName)) || null;

    if (!latitudeColName || !longitudeColName) {
        throw new Error(`Unsupported format: ${csvResult.fields.join(', ')}`);
    }

    // Segments mode
    if (segmentColName) {
        const segments: TrajectorySegment[] = csvResult.data.reduce(
            (acc: TrajectorySegment[], row) => {
                const coord = new PointData(parseFloat(row[latitudeColName]), parseFloat(row[longitudeColName]), row);
                if (acc.length < 1 || acc[acc.length - 1].segmentId != row[segmentColName]) {
                    acc.push(new TrajectorySegment(row[segmentColName]));
                }
                acc[acc.length - 1].coords.push(coord);
                return acc;
            },
            []);
        return new SegmentsMapLayer(sourceName, segments, csvResult.fields, map);
    }

    // GPS mode
    const coords = csvResult.data
        .map(row => new PointData(parseFloat(row[latitudeColName]), parseFloat(row[longitudeColName]), row));
    return new GPSMapLayer(sourceName, coords, csvResult.fields, map);
}