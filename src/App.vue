<template>
    <div class="tviz-app">
        <div class="control-panel">
            <source-layer-control v-for="layer in layers"
                :key="layer.name"
                :map-layer="layer"
                :active="layer === activeLayer"
            />
            <input type="file"
                :disabled="isInProgress"
                @change="csvFileOpenedHandler"
            >
            <button @click="showCsvRowsModal">
                Show selected
            </button>
        </div>
        <div class="map-panel"></div>
        <div v-if="isModalVisible"
            class="popup-dialog-veil"
        >
            <div class="popup-dialog-content">
                <csv-table-component :csv-data="csvDialogData" />
                <div class="popup-dialog-buttons">
                    <button @click="hideModal">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    /* eslint-disable no-console */

    import {map as lMap, Map as Lmap, tileLayer} from 'leaflet';
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import SourceLayerControl from './components/SourceLayerControl';
    import CsvTableComponent from './components/CsvTableComponent';
    import {mapLayersFactory} from './mapLayers/mapLayersFactory';
    import {csvLoader} from './csvLoader';
    import {SourceMapLayer} from './mapLayers/SourceMapLayer';

    @Component({components: {SourceLayerControl, CsvTableComponent}})
    export default class App extends Vue {
        private __map!: Lmap;
        // ToDo: Use index or id???
        activeLayer: SourceMapLayer|null = null;
        layers: SourceMapLayer[] = [];
        isInProgress: boolean = false;

        csvDialogData: string[][] = [];
        get isModalVisible() {
            return this.csvDialogData.length > 0;
        }

        csvFileOpenedHandler(event: Event) {
            const fileInput = event.target as HTMLInputElement;
            if (!fileInput.files) return;

            const file = fileInput.files[0];
            if (!file || this.layers.some(lr => lr.layerName === file.name)) return;

            console.log(`File ${file.name}: ${file.size} bytes.`);
            this.isInProgress = true;
            // ToDo: Rework to DI
            csvLoader.loadCsv(file)
                // ToDo: Rework to DI
                .then(csvResult => mapLayersFactory.createMapLayer(csvResult, this.__map))
                .then(newLayer => {
                    this.layers.unshift(newLayer);
                    this.activeLayer = newLayer;
                    // ToDo: Find better solution
                    this.activeLayer.isActive = true;
                    this.activeLayer.fitMap();
                })
                .catch(console.error)
                .finally(() => {
                    // ToDo: check browser compatibility
                    fileInput.value = null;
                    this.isInProgress = false;
                });
        }

        showCsvRowsModal() {
            if (!this.activeLayer) return;

            this.csvDialogData = [this.activeLayer.getDataHeader(), ...this.activeLayer.getSelectionData()];
        }

        hideModal() {
            this.csvDialogData = [];
        }

        mounted() {
            this.$on('remove-layer', (layer: SourceMapLayer) => this.layers.splice(this.layers.indexOf(layer), 1));
            this.$on('set-active-layer', (layer: SourceMapLayer) => (this.activeLayer = layer));

            // eslint-disable-next-line no-magic-numbers
            this.__map = lMap(this.$el.querySelector('.map-panel') as HTMLElement).setView([51.505, -0.09], 13);
            tileLayer(
                'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    subdomains: ['a', 'b', 'c']
                }
            ).addTo(this.__map);
        }
    }
</script>

<style>
    .tviz-app {
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        width: 100vw;
        height: 100vh;
    }

    .tviz-app > .control-panel {
        flex: 1 0 auto;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.32);
        z-index: 500;
        background-color: #f2f2f2;
    }

    .tviz-app > .map-panel {
        flex: 1 1 100%;
    }

    .popup-dialog-veil {
        display: flex;
        align-items: center;
        position: fixed;
        width: 100%;
        height: 100%;
        background-color: rgba(160, 160, 160, 0.4);
        z-index: 999;
        justify-content: center;
        padding: 10px;
        box-sizing: border-box;
    }

    .popup-dialog-content {
        flex: 0 0 auto;
        padding: 10px;
        background-color: white;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.32);
        max-width: 100%;
        box-sizing: border-box;
    }

    .popup-dialog-buttons {
        text-align: right;
        margin-top: 10px;
    }
</style>
