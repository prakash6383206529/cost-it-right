import React from "react";
import ReactExport from 'react-export-excel';
import {
    Fuel, OverheadAndProfit, Power, RM, Supplier, Plant,
    Bought_Out_Parts, Processes, MachineClass, Labour, Operation,
    OtherOperation,
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
            case 'Supplier':
                return this.returnExcelColumn(Supplier);
            case 'Plant':
                return this.returnExcelColumn(Plant);
            case 'BOP':
                return this.returnExcelColumn(Bought_Out_Parts);
            case 'Processes':
                return this.returnExcelColumn(Processes);
            case 'MachineClass':
                return this.returnExcelColumn(MachineClass);
            case 'Labour':
                return this.returnExcelColumn(Labour);
            case 'Operation':
                return this.returnExcelColumn(Operation);
            case 'OtherOperation':
                return this.returnExcelColumn(OtherOperation);
            case 'Fuel':
                return this.returnExcelColumn(Fuel);
            case 'OverheadAndProfit':
                return this.returnExcelColumn(OverheadAndProfit);
            case 'Power':
                return this.returnExcelColumn(Power);
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