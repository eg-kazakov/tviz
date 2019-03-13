import {IMapLayer, MapLayerBase} from './MapLayerBase';
import {Map as LMap} from 'leaflet';

export class MapLayersGroup implements IMapLayer {
    private readonly __layers: MapLayerBase[];
    private readonly __map: LMap;
    private __isVisible: boolean = true;
    private __isActive: boolean = true;
    readonly layerName: string;

    constructor(map: LMap, sourceName: string, layers: MapLayerBase[]){
        this.__layers = layers;
        this.__map = map;
        this.layerName = sourceName;
    }

    get fullTitle(): string {
        return `${this.__layers[0].typeNamePrefix}: ${this.layerName}`
    }

    get isVisible(){
        return this.__isVisible;
    }

    set isVisible(isVisible: boolean){
        if(this.__isVisible === isVisible) return;

        this.__layers.forEach(layer => layer.isVisible = isVisible);
        this.__isVisible = isVisible;
    }

    get isActive(){
        return this.__isActive;
    }

    set isActive(isActive: boolean) {
        if(this.__isActive === isActive) return;

        this.__layers.forEach(layer => layer.isVisible = isActive);
        this.__isActive = isActive;
    }

    fitMap() {
        this.__layers.reduce((bounds, layer) => bounds.extend(layer.getBounds()), this.__layers[0].getBounds())
    }

    clearMap() {
        this.__layers.forEach(layer => layer.clearMap());
    }

    getDataHeader(): string[] {
        return this.__layers[0].getDataHeader();
    }

    getSelectionData(): string[][] {
        return this.__layers.flatMap((layer: MapLayerBase) => layer.getSelectionData());
    }
}
