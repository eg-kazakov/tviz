import {CircleMarker, featureGroup, Map as LMap, polyline, Polyline} from 'leaflet';
import {MapLayerBase, createCircleMarker} from './MapLayerBase';
import {TrajectorySegment} from '../TrajectorySegment';
import {ColorRotator} from '../colorsHelper';

export class SegmentsMapLayer extends MapLayerBase {
    readonly typeNamePrefix: string = 'Seg';

    constructor(name: string, segments: TrajectorySegment[], csvHeader: string[], map: LMap){
        super(map, name, csvHeader);
        this.__drawMarkers(segments);
    }

    private __drawMarkers(segments: TrajectorySegment[]){
        const lines: Polyline[] = [];
        const markers: CircleMarker[] =  [];
        const colorer = new ColorRotator();
        for(const segment of segments){
            const color = colorer.nextColor();
            lines.push(polyline(segment.coords, {color, interactive: false}));
            for (const coordWithRow of segment.coords){
                const marker = createCircleMarker(coordWithRow, color);
                marker.on('click', (evt: any) => {
                    this.__toggleMarkerSelected(marker);
                    evt.originalEvent.preventDefault();
                });
                this.__markerToSourceMap.set(marker, coordWithRow.csvRow);
                markers.push(marker);
            }
        }
        this.__features = featureGroup([...markers, ...lines]);


        if (this.__isVisible) this.__features.addTo(this.__map);
    }
}