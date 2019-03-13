import {CircleMarker, featureGroup, Map as LMap} from 'leaflet';
import {MapLayerBase, createCircleMarker} from './MapLayerBase';
import {PointData} from '../PointData';

export class GPSMapLayer extends MapLayerBase {
    constructor(name: string, points: PointData[], csvHeader: string[], map: LMap){
        super(map, name, csvHeader);
        this.__drawMarkers(points);
    }

    get fullTitle(): string {
        return `GPS: ${this.sourceName}`
    }

    private __drawMarkers(coords: PointData[]){
        const markers: CircleMarker[] = [];
        for (const coordWithData of coords) {
            const marker = createCircleMarker(coordWithData, '#aaaaaa');
            this.__markerToSourceMap.set(marker, coordWithData.csvRow);
            markers.push(marker);
        }
        this.__features = featureGroup(markers);

        // ToDo: find a better vay to fix type check
        this.__features.on('click', (evt: any) => {
            this.__toggleMarkerSelected(evt.sourceTarget);
            evt.originalEvent.preventDefault();
        });

        if (this.__isVisible) this.__features.addTo(this.__map);
    }
}