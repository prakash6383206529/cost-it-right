import React from "react";
import ReactExport from 'react-export-excel';
import {
    Fuel, OverheadAndProfit, RMDomestic, RMImport, Supplier, Plant,
    Bought_Out_Parts, Processes, MachineClass, Labour, Operation,
    OtherOperation, Power, MHR,
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

class Downloadxls extends React.Component {

    /**
    * @method renderSwitch
    * @description Switch case for different xls file head according to master
    */
    renderSwitch = (master) => {

        switch (master) {
            case 'RMDomestic':
                return this.returnExcelColumn(RMDomestic);
            case 'RMImport':
                return this.returnExcelColumn(RMImport);
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
            case 'Power':
                return this.returnExcelColumn(Power);
            case 'OverheadAndProfit':
                return this.returnExcelColumn(OverheadAndProfit);
            case 'MHR':
                return this.returnExcelColumn(MHR);
            case 'Fuel':
                return this.returnExcelColumn(Fuel);
            default:
                return 'foo';
        }
    }

    /**
        * @method returnExcelColumn
        * @description Used to get excel column names
        */
    returnExcelColumn = (data) => {
        const { fileName, failedData, isFailedFlag } = this.props;
        return (<ExcelSheet data={isFailedFlag ? failedData : []} name={fileName}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.label} />)}
        </ExcelSheet>);
    }

    render() {
        const { failedData, isFailedFlag, fileName } = this.props;

        if (isFailedFlag) {
            return (
                <ExcelFile hideElement={true} filename={fileName} fileExtension={'.xls'} >
                    {isFailedFlag ? this.renderSwitch(fileName) : ''}
                </ExcelFile>
            );
        }

        return (
            <ExcelFile filename={fileName} fileExtension={'.xls'} element={<button type="button" className={'btn btn-primary pull-right'}>Download File</button>}>
                {fileName ? this.renderSwitch(fileName) : ''}
            </ExcelFile>
        );
    }
}

export default Downloadxls;