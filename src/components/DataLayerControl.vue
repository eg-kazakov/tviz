<template>
    <div class="data-layer-control">
        <input v-model="isVisible"
            type="checkbox"
            @click.stop=""
        >
        <div class="layer-control-name"
            :title="name"
        >
            {{ name }}
        </div>
        <button class="layer-control-button"
            @click.stop="fitMap"
        >
            &#10536;&#10538;
        </button>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import {DataMapLayerBase} from '../mapLayers/DataMapLayerBase';

    @Component
    export default class DataLayerControl extends Vue {
        @Prop()
        readonly mapLayer!: DataMapLayerBase;

        get name(): string {
            return `${this.mapLayer.chunkColName}: ${this.mapLayer.layerName}`;
        }

        get isVisible(): boolean {
            return this.mapLayer.isVisible;
        }

        set isVisible(isVisible: boolean) {
            this.mapLayer.isVisible = isVisible;
        }

        fitMap() {
            this.mapLayer.fitMap();
        }
    }
</script>

<style>
    .data-layer-control {
        font-size: 0.7em;
        display: flex;
        align-items: center;
        padding: 0.4em 0.2em 0.4em 1.1em;
        border-bottom: solid 1px #C8C8C8;
        background-color: inherit;
    }

    .data-layer-control:hover {
        background-color: #C8C8C8;
    }

    .data-layer-control > .layer-control-name {
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .data-layer-control > .layer-control-button {
        font-size: 0.9rem;
        padding: 0;
    }

    .data-layer-control > :not(:last-child){
        margin-right: 0.1em;
    }
</style>
