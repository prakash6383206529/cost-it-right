import React from "react";
import ReactExport from 'react-export-excel';
import {
    BOP_Domestic, BOP_Import, MHR_Casting_Ferrous_VBC, Fuel, MHR_Forging_VBC, MHR_VBC, MHR_ZBC,
    OtherOperation, OverheadAndProfit, Power, RawMaterial_Domestic, RawMaterial_Import, RM,
} from '../../config/masterData';

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

class DownloadMasterxls extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    /**
    * @method renderSwitch
    * @description Switch case for different xls file head according to master
    */
    renderSwitch = (master) => {

        switch (master) {
            case 'BOP-Domestic':
                return this.returnExcelColumn(BOP_Domestic);
            case 'BOP-Import':
                return this.returnExcelColumn(BOP_Import);
            case 'Fuel':
                return this.returnExcelColumn(Fuel);
            case 'MHR-Casting-Ferrous-VBC':
                return this.returnExcelColumn(MHR_Casting_Ferrous_VBC);
            case 'MHR-Forging-VBC':
                return this.returnExcelColumn(MHR_Forging_VBC);
            case 'MHR-VBC':
                return this.returnExcelColumn(MHR_VBC);
            case 'MHR-ZBC':
                return this.returnExcelColumn(MHR_ZBC);
            case 'OtherOperation':
                return this.returnExcelColumn(OtherOperation);
            case 'OverheadAndProfit':
                return this.returnExcelColumn(OverheadAndProfit);
            case 'Power':
                return this.returnExcelColumn(Power);
            case 'RawMaterial-Domestic':
                return this.returnExcelColumn(RawMaterial_Domestic);
            case 'RawMaterial-Import':
                return this.returnExcelColumn(RawMaterial_Import);
            case 'RM':
                return this.returnExcelColumn(RM);
            default:
                return 'foo';
        }
    }

    /**
    * @method returnExcelColumn
    * @description Used to get excel column names
    */
    returnExcelColumn = (data) => {
        const { selectedMaster } = this.props;
        return (<ExcelSheet data={dataSet1} name={selectedMaster ? selectedMaster.label : ''}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.label} />)}
        </ExcelSheet>);
    }

    render() {
        const { selectedMaster } = this.props;
        return (
            <ExcelFile filename={selectedMaster ? selectedMaster.label : ''} fileExtension={'.xls'} element={<button className={'btn btn-primary pull-right'}>Download File</button>}>
                {selectedMaster ? this.renderSwitch(selectedMaster.label) : ''}
            </ExcelFile>
        );
    }
}

export default DownloadMasterxls;