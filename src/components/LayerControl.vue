<template>
    <div class="layer-control">
        <input
            v-model="isVisible"
            type="checkbox"
        >
        <div
            class="layer-control-name"
            :title="name"
        >
            {{ name }}
        </div>
        <button
            class="layer-control-button"
            @click="fitMap"
        >
            &#10536;&#10538;
        </button>
        <button
            class="layer-control-button"
            @click="removeLayer"
        >
            &#10062;
        </button>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import {MapLayerBase} from '../mapLayers/MapLayerBase';

    @Component
    export default class LayerControl extends Vue {
        @Prop()
        readonly mapLayer!: MapLayerBase;

        get name(): String {
            return this.mapLayer.fullTitle;
        }

        get isVisible():boolean {
            return this.mapLayer.isVisible;
        }

        set isVisible(isVisible: boolean) {
            this.mapLayer.isVisible = isVisible;
        }

        removeLayer() {
            this.mapLayer.clearMap();
            this.$parent.$emit('remove-layer', this.mapLayer);
        }

        fitMap() {
            this.mapLayer.fitMap();
        }

        mounted() {
            this.fitMap();
        }
    }
</script>

<style>
    .layer-control {
        font-size: 0.9em;
        display: flex;
        align-items: center;
        padding: 0.1em;
    }

    .layer-control > .layer-control-name {
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .layer-control > .layer-control-button {
        font-size: inherit;
        padding: 0;
    }

    .layer-control > :not(:last-child){
        margin-right: 0.1em;
    }
</style>
