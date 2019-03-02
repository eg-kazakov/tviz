import {CircleMarker, featureGroup, Map as LMap, polyline, Polyline} from 'leaflet';
import {MapLayerBase, createCircleMarker} from './MapLayerBase';
import {TrajectorySegment} from '../TrajectorySegment';
import {ColorRotator} from '../colorsHelper';

export class SegmentsMapLayer extends MapLayerBase {
    constructor(name: String, segments: TrajectorySegment[], map: LMap){
        super(map, name);
        this.__drawMarkers(segments);
    }

    get fullTitle(): String {
        return `Seg: ${this.sourceName}`
    }

    private __drawMarkers(segments: TrajectorySegment[]){
        const lines: Polyline[] = [];
        const markers: CircleMarker[] =  [];
        const colorer = new ColorRotator();
        for(const segment of segments){
            const color = colorer.nextColor();
            lines.push(polyline(segment.points, {color}));
            for (const coord of segment.points){
                markers.push(createCircleMarker(coord, color));
            }
        }
        this.__features = featureGroup([...markers, ...lines]);

        if (this.__isVisible) this.__features.addTo(this.__map);
    }
}