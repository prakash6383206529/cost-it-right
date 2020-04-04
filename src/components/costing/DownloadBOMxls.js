import React from "react";
import ReactExport from 'react-export-excel';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const dataSet1 = [
    // {
    //     name: "Johson",
    //     amount: 30000,
    //     sex: 'M',
    //     is_married: true
    // }
];

class DownloadBOMxls extends React.Component {
    render() {
        return (
            <ExcelFile filename={'BOM'} fileExtension={'.xls'} element={<button className={'btn btn-primary pull-right'}>Download BOM Format</button>}>
                <ExcelSheet data={dataSet1} name="BOM">
                    <ExcelColumn label="BOMLevel" value="BOMLevel" />
                    <ExcelColumn label="AssemblyPartNumber" value="AssemblyPartNumber" />
                    <ExcelColumn label="PartNumber" value="PartNumber" />
                    <ExcelColumn label="MaterialDescription" value="MaterialDescription" />
                    <ExcelColumn label="MaterialGroupCode" value="MaterialGroupCode" />
                    <ExcelColumn label="PartType" value="PartType" />
                    <ExcelColumn label="PlantName" value="PlantName" />
                    <ExcelColumn label="RawMaterialName" value="RawMaterialName" />
                    <ExcelColumn label="UnitOfMeasurementName" value="UnitOfMeasurementName" />
                    <ExcelColumn label="TechnologyName" value="TechnologyName" />
                    <ExcelColumn label="Quantity" value="Quantity" />
                    <ExcelColumn label="RevisionNumber" value="RevisionNumber" />
                    <ExcelColumn label="EcoNumber" value="EcoNumber" />
                    <ExcelColumn label="Assembly" value="Assembly" />
                </ExcelSheet>
            </ExcelFile>
        );
    }
}

export default DownloadBOMxls;