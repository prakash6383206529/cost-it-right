import React from "react";
import ReactExport from 'react-export-excel';
import { Row, Col } from 'reactstrap';
import {
    Fuel, OverheadAndProfit, RMDomesticZBC, RMDomesticZBCTempData, RMDomesticVBC, RMDomesticVBCTempData,
    RMImportZBC, RMImportZBCTempData, RMImportVBC, RMImportVBCTempData,
    RMSpecification, RMSpecificationXLTempData, Supplier, Plant,
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
            case 'RMSpecification':
                return this.returnExcelColumn(RMSpecification, RMSpecificationXLTempData);
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
    * @method renderZBCSwitch
    * @description Switch case for different xls file head according to master
    */
    renderZBCSwitch = (master) => {

        switch (master) {
            case 'RMDomestic':
                return this.returnExcelColumn(RMDomesticZBC, RMDomesticZBCTempData);
            case 'RMImport':
                return this.returnExcelColumn(RMImportZBC, RMImportZBCTempData);
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
    * @method renderVBCSwitch
    * @description Switch case for different xls file head according to master
    */
    renderVBCSwitch = (master) => {

        switch (master) {
            case 'RMDomestic':
                return this.returnExcelColumn(RMDomesticVBC, RMDomesticVBCTempData);
            case 'RMImport':
                return this.returnExcelColumn(RMImportVBC, RMImportVBCTempData);
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
    returnExcelColumn = (data, TempData) => {
        const { fileName, failedData, isFailedFlag } = this.props;

        if (isFailedFlag) {
            let addObj = { label: 'Reason', value: 'Reason' }
            data.push(addObj)
        }

        return (<ExcelSheet data={isFailedFlag ? failedData : TempData} name={fileName}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.label} />)}
        </ExcelSheet>);
    }

    render() {
        const { failedData, isFailedFlag, fileName, isZBCVBCTemplate, costingHead } = this.props;

        if (isFailedFlag && costingHead == 'ZBC' && (fileName == 'RMDomestic' || fileName == 'RMImport')) {
            return (
                <ExcelFile hideElement={true} filename={fileName} fileExtension={'.xls'} >
                    {this.renderZBCSwitch(fileName)}
                </ExcelFile>
            );
        }

        if (isFailedFlag && costingHead == 'VBC' && (fileName == 'RMDomestic' || fileName == 'RMImport')) {
            return (
                <ExcelFile hideElement={true} filename={fileName} fileExtension={'.xls'} >
                    {this.renderVBCSwitch(fileName)}
                </ExcelFile>
            );
        }

        if (isFailedFlag && (fileName == 'RMSpecification')) {
            return (
                <ExcelFile hideElement={true} filename={fileName} fileExtension={'.xls'} >
                    {this.renderSwitch(fileName)}
                </ExcelFile>
            );
        }

        if (isZBCVBCTemplate) {
            return (
                <>
                    <Col md="6">
                        <ExcelFile filename={fileName} fileExtension={'.xls'} element={<button type="button" className={'btn btn-primary pull-right'}>Download ZBC</button>}>
                            {fileName ? this.renderZBCSwitch(fileName) : ''}
                        </ExcelFile>
                    </Col>
                    <Col md="6">
                        <ExcelFile filename={fileName} fileExtension={'.xls'} element={<button type="button" className={'btn btn-primary pull-right'}>Download VBC</button>}>
                            {fileName ? this.renderVBCSwitch(fileName) : ''}
                        </ExcelFile>
                    </Col>
                </>
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