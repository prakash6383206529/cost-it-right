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

class DownloadRMDomesticxls extends React.Component {
    render() {
        return (
            <ExcelFile filename={'RMDomestic'} fileExtension={'.xls'} element={<button className={'btn btn-primary pull-right'}>DOWNLOAD TEMPLATE</button>}>
                <ExcelSheet data={dataSet1} name="RMDomestic">
                    <ExcelColumn label="CostingHead" value="CostingHead" />
                    <ExcelColumn label="RawMaterial" value="RawMaterial" />
                    <ExcelColumn label="RMGrade" value="RMGrade" />
                    <ExcelColumn label="RMSpec" value="RMSpec" />
                    <ExcelColumn label="Category" value="Category" />
                    <ExcelColumn label="Plant" value="Plant" />
                    <ExcelColumn label="VendorName" value="VendorName" />
                    <ExcelColumn label="VendorPlant" value="VendorPlant" />
                    <ExcelColumn label="VendorLocation" value="VendorLocation" />
                    <ExcelColumn label="HasDifferentSource" value="HasDifferentSource" />
                    <ExcelColumn label="Source" value="Source" />
                    <ExcelColumn label="SourceLocation" value="SourceLocation" />
                    <ExcelColumn label="UOM" value="UOM" />
                    <ExcelColumn label="BasicRate" value="BasicRate" />
                    <ExcelColumn label="ScrapRate" value="ScrapRate" />
                    <ExcelColumn label="Remark" value="Remark" />
                </ExcelSheet>
            </ExcelFile>
        );
    }
}

export default DownloadRMDomesticxls;