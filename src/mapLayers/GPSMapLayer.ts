import {CircleMarker, featureGroup, LayerEvent, LeafletEvent, LeafletMouseEvent, Map as LMap} from 'leaflet';
import {DataMapLayerBase, createCircleMarker} from './DataMapLayerBase';
import {PointData} from '../PointData';

export class GPSMapLayer extends DataMapLayerBase {
    readonly typeNamePrefix: string = 'gps';

    constructor(name: string, points: PointData[], csvHeader: string[], chunkColName: string, map: LMap) {
        super(map, name, csvHeader, chunkColName);
        this.__drawMarkers(points);
    }

    private __drawMarkers(coords: PointData[]) {
        const markers: CircleMarker[] = [];
        for (const coordWithData of coords) {
            const marker = createCircleMarker(coordWithData, '#aaaaaa');
            this.__markerToSourceMap.set(marker, coordWithData.csvRow);
            markers.push(marker);
        }
        this.__features = featureGroup(markers);

        // ToDo: find a better vay to fix type check
        this.__features.on('click', (evt: LeafletEvent) => {
            this.__toggleMarkerSelected((evt as LayerEvent).layer as CircleMarker);
            (evt as LeafletMouseEvent).originalEvent.preventDefault();
        });

        if (this.__isVisible) this.__features.addTo(this.__map);
    }
}
