<template>
    <div class="csv-table-wrapper">
        <table class="csv-table">
            <thead>
                <tr>
                    <th v-for="(colName, colIdx) in csvHeader"
                        :key="colIdx"
                    >
                        {{ colName }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(csvRow, rowIdx) in csvRows"
                    :key="rowIdx"
                >
                    <td v-for="(csvValue, colIdx) in csvRow"
                        :key="colIdx"
                    >
                        {{ csvValue }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Prop, Component} from 'vue-property-decorator';

    @Component
    export default class CsvTableComponent extends Vue {
        @Prop()
        csvData!: string[][];

        get csvHeader() {
            if (this.csvData.length < 2) return [];
            return this.csvData[0];
        }

        get csvRows() {
            if (this.csvData.length < 2) return [];
            return this.csvData.slice(1);
        }
    }
</script>

<style>
    .csv-table-wrapper {
        max-width: 100%;
        max-height: 100%;
        overflow: auto;
    }

    table.csv-table {
        empty-cells: show;
        border: 1px solid #cbcbcb;
        border-collapse: collapse;
        border-spacing: 0;
    }

    .csv-table > thead {
        background-color: #e0e0e0;
        color: #000;
        text-align: left;
        vertical-align: bottom;
    }

    .csv-table td:first-child, .csv-table th:first-child {
        border-left-width: 0;
    }

    .csv-table th, .csv-table td {
        padding: 0.5em 1em;
    }

    .csv-table td, .csv-table th {
        border-left: 1px solid #cbcbcb;
        font-size: inherit;
        margin: 0;
        overflow: visible;
        padding: .5em 1em;
    }

    .csv-table tr:nth-child(2n-1) td {
        background-color: #f2f2f2;
    }
    .csv-table td {
        background-color: transparent;
    }
</style>
