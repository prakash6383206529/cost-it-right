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
                    <ExcelColumn label="SN" value="SN" />
                    <ExcelColumn label="BOMNo" value="BOMNo" />
                    <ExcelColumn label="Assy" value="Assy" />
                    <ExcelColumn label="MaterialCODE" value="MaterialCODE" />
                    <ExcelColumn label="MaterialDescription" value="MaterialDescription" />
                    <ExcelColumn label="MaterialType" value="MaterialType" />
                    <ExcelColumn label="UOM" value="UOM" />
                    <ExcelColumn label="Quantity" value="Quantity" />
                    <ExcelColumn label="AssyMark" value="AssyMark" />
                    <ExcelColumn label="LEVEL" value="LEVEL" />
                    <ExcelColumn label="EcoNo" value="EcoNo" />
                    <ExcelColumn label="RevNo" value="RevNo" />
                </ExcelSheet>
            </ExcelFile>
        );
    }
}

export default DownloadBOMxls;