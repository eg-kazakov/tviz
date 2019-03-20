import {Map as LMap} from 'leaflet';

import {GPSMapLayer} from './GPSMapLayer';
import {ICsvData} from '../csvLoader';
import {TrajectorySegment} from '../TrajectorySegment';
import {PointData} from '../PointData';
import {SegmentsMapLayer} from './SegmentsMapLayer';
import {SourceMapLayer} from './SourceMapLayer';

function parseGPS(csvData: Array<{[key: string]: string}>
    , latitudeColName: string
    , longitudeColName: string
): PointData[] {
    return csvData.map(row => new PointData(parseFloat(row[latitudeColName]), parseFloat(row[longitudeColName]), row));
}

function parseSegments(csvData: Array<{[key: string]: string}>
                       , latitudeColName: string
                       , longitudeColName: string
                       , segmentColName: string): TrajectorySegment[] {
    return csvData.reduce(
        (acc: TrajectorySegment[], row) => {
            const coord: PointData
                = new PointData(parseFloat(row[latitudeColName]), parseFloat(row[longitudeColName]), row);
            if (acc.length < 1 || acc[acc.length - 1].segmentId !== row[segmentColName]) {
                acc.push(new TrajectorySegment(row[segmentColName]));
            }
            acc[acc.length - 1].coords.push(coord);
            return acc;
        },
        []);
}

function createMapLayer(csvResult: ICsvData, map: LMap): SourceMapLayer {
    //ToDo: Rework columns detection solution
    const inputColsDict: Map<string, string> = csvResult.fields.reduce((dict, fld) => {
        dict.set(fld.trim(), fld);
        return dict;
    }, new Map());

    const latitudeColNames = ['lat', 'latitude', 'snap_lat'];
    const latitudeNormColName = latitudeColNames.find(latName => inputColsDict.has(latName)) || null;
    const latitudeColName = latitudeNormColName ? inputColsDict.get(latitudeNormColName) : null;

    const longitudeColNames = ['lng', 'lon', 'long', 'longitude', 'snap_lon'];
    const longitudeNormColName = longitudeColNames.find(lngName => inputColsDict.has(lngName)) || null;
    const longitudeColName = longitudeNormColName ? inputColsDict.get(longitudeNormColName) : null;

    const segmentColNames = ['segment_id'];
    const segmentNormColName = segmentColNames.find(segName => inputColsDict.has(segName)) || null;
    const segmentColName = segmentNormColName ? inputColsDict.get(segmentNormColName) : null;

    const chunkColNames = ['trip_id', 'trajectory_id', 'probe', 'probe_id'];
    const chunkNormColName = chunkColNames.find(chunkName => inputColsDict.has(chunkName)) || null;
    const chunkColName = chunkNormColName ? inputColsDict.get(chunkNormColName) : null;

    if (!latitudeColName || !longitudeColName) {
        throw new Error(`Unsupported format: ${csvResult.fields.join(', ')}`);
    }

    const chunksDict: Map<string, Array<{[key: string]: string}>> =
        chunkColName
            ? csvResult.data.reduce((acc, row) => {
                if (acc.has(row[chunkColName])) acc.get(row[chunkColName]).push(row);
                else acc.set(row[chunkColName], [row]);
                return acc;
            }, new Map())
            : new Map([[csvResult.fileName, csvResult.data]]);

    const sourceLayer = new SourceMapLayer(map, csvResult.fileName, [], csvResult.fields);
    for (const [key, value] of chunksDict.entries()) {
        if (segmentColName) {
            const segments = parseSegments(value, latitudeColName, longitudeColName, segmentColName);
            sourceLayer.subLayers.push(
                new SegmentsMapLayer(key, segments, csvResult.fields, chunkColName || '', map));
        } else {
            const coords = parseGPS(value, latitudeColName, longitudeColName);
            sourceLayer.subLayers.push(
                new GPSMapLayer(key, coords, csvResult.fields, chunkColName || '', map));
        }
    }
    return sourceLayer;
}

export const mapLayersFactory = {
    createMapLayer
};
