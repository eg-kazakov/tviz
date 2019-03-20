import {DataMapLayerBase} from './DataMapLayerBase';
import {Map as LMap} from 'leaflet';

export class SourceMapLayer {
    private readonly __map: LMap;
    private readonly __csvHeader: string[];
    private __isVisible: boolean = true;
    private __isActive: boolean = false;
    readonly layerName: string;
    readonly subLayers: DataMapLayerBase[];

    constructor(map: LMap, sourceName: string, layers: DataMapLayerBase[], csvHeader: string[]) {
        this.__map = map;
        this.subLayers = layers;
        this.layerName = sourceName;
        this.__csvHeader = csvHeader;
    }

    get typeNamePrefix(): string {
        return this.subLayers.length > 0 ? this.subLayers[0].typeNamePrefix : 'EMPT';
    }

    get isVisible() {
        return this.__isVisible;
    }

    set isVisible(isVisible: boolean) {
        if (this.__isVisible === isVisible) return;

        this.subLayers.forEach(layer => layer.isVisible = isVisible);
        this.__isVisible = isVisible;
    }

    get isActive() {
        return this.__isActive;
    }

    set isActive(isActive: boolean) {
        if (this.__isActive === isActive) return;

        this.subLayers.forEach(layer => layer.isActive = isActive);
        this.__isActive = isActive;
    }

    getDataHeader(): string[] {
        return this.__csvHeader;
    }

    fitMap() {
        this.__map.fitBounds(
            this.subLayers.reduce((bounds, layer) => bounds.extend(layer.getBounds()), this.subLayers[0].getBounds()));
    }

    clearMap() {
        this.subLayers.forEach(layer => layer.clearMap());
    }

    getSelectionData(): string[][] {
        return this.subLayers.flatMap((layer: DataMapLayerBase) => layer.getSelectionData());
    }

    resetSelection() {
        this.subLayers.forEach(lr => lr.resetSelection());
    }
}
