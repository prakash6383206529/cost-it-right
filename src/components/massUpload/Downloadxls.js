import React from "react";
import ReactExport from 'react-export-excel';
import {
    Fuel, FuelTempData,
    RMDomesticZBC, RMDomesticZBCTempData, RMDomesticVBC, RMDomesticVBCTempData,
    RMImportZBC, RMImportZBCTempData, RMImportVBC, RMImportVBCTempData,
    RMSpecification, RMSpecificationXLTempData,
    Vendor, VendorTempData,
    Overhead, OverheadTempData, Profit, ProfitTempData,
    ZBCOperation, ZBCOperationTempData, VBCOperation, VBCOperationTempData,
    Bought_Out_Parts, Processes, MachineClass, Labour,
    OtherOperation, Power, MHR,
} from '../../config/masterData';
import { checkVendorPlantConfigurable } from "../../helper";

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

    checkVendorPlantConfig = (excelData) => {
        return excelData.filter((el) => {
            if (checkVendorPlantConfigurable() == false) {
                if (el.value == 'VendorPlant') return false;
                return true;
            }
            return true;
        })
    }
    /**
    * @method renderSwitch
    * @description Switch case for different xls file head according to master
    */
    renderSwitch = (master) => {

        switch (master) {
            case 'RMSpecification':
                return this.returnExcelColumn(RMSpecification, RMSpecificationXLTempData);
            case 'Vendor':
                return this.returnExcelColumn(Vendor, VendorTempData);
            case 'Overhead':
                return this.returnExcelColumn(Overhead, OverheadTempData);
            case 'Fuel':
                return this.returnExcelColumn(Fuel, FuelTempData);
            case 'Profit':
                return this.returnExcelColumn(Profit, ProfitTempData);
            case 'BOP':
                return this.returnExcelColumn(Bought_Out_Parts);
            case 'Processes':
                return this.returnExcelColumn(Processes);
            case 'MachineClass':
                return this.returnExcelColumn(MachineClass);
            case 'Labour':
                return this.returnExcelColumn(Labour);
            case 'OtherOperation':
                return this.returnExcelColumn(OtherOperation);
            case 'Power':
                return this.returnExcelColumn(Power);
            case 'MHR':
                return this.returnExcelColumn(MHR);
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
            case 'Operation':
                return this.returnExcelColumn(ZBCOperation, ZBCOperationTempData);
            case 'BOP':
                return this.returnExcelColumn(Bought_Out_Parts);
            case 'Processes':
                return this.returnExcelColumn(Processes);
            case 'MachineClass':
                return this.returnExcelColumn(MachineClass);
            case 'Labour':
                return this.returnExcelColumn(Labour);
            case 'OtherOperation':
                return this.returnExcelColumn(OtherOperation);
            case 'Power':
                return this.returnExcelColumn(Power);
            case 'MHR':
                return this.returnExcelColumn(MHR);
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
                return this.returnExcelColumn(this.checkVendorPlantConfig(RMDomesticVBC), RMDomesticVBCTempData);
            case 'RMImport':
                return this.returnExcelColumn(this.checkVendorPlantConfig(RMImportVBC), RMImportVBCTempData);
            case 'Operation':
                return this.returnExcelColumn(VBCOperation, VBCOperationTempData);
            case 'BOP':
                return this.returnExcelColumn(Bought_Out_Parts);
            case 'Processes':
                return this.returnExcelColumn(Processes);
            case 'MachineClass':
                return this.returnExcelColumn(MachineClass);
            case 'Labour':
                return this.returnExcelColumn(Labour);
            case 'OtherOperation':
                return this.returnExcelColumn(OtherOperation);
            case 'Power':
                return this.returnExcelColumn(Power);
            case 'MHR':
                return this.returnExcelColumn(MHR);
            default:
                return 'foo';
        }
    }

    /**
    * @method returnExcelColumn
    * @description Used to get excel column names
    */
    returnExcelColumn = (data = [], TempData) => {
        const { fileName, failedData, isFailedFlag } = this.props;

        if (isFailedFlag) {
            //Below condition to add 'Reason' column while download Excel sheet when file goes failed
            let isContentReason = data.filter(d => d.label == 'Reason')
            if (isContentReason.length == 0) {
                let addObj = { label: 'Reason', value: 'Reason' }
                data.push(addObj)
            }
        }

        return (<ExcelSheet data={isFailedFlag ? failedData : TempData} name={fileName}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.label} />)}
        </ExcelSheet>);
    }

    render() {
        const { failedData, isFailedFlag, fileName, isZBCVBCTemplate, costingHead } = this.props;

        // Download file:- Called when ZBC upload failed   hideElement={true}
        if (isFailedFlag && costingHead == 'ZBC' && (fileName == 'RMDomestic' || fileName == 'RMImport' || fileName == 'Operation')) {
            return (
                <ExcelFile hideElement={true} filename={fileName} fileExtension={'.xls'} >
                    {this.renderZBCSwitch(fileName)}
                </ExcelFile>
            );
        }

        // Download file:- Called when VBC upload failed
        if (isFailedFlag && costingHead == 'VBC' && (fileName == 'RMDomestic' || fileName == 'RMImport' || fileName == 'Operation')) {
            return (
                <ExcelFile hideElement={true} filename={fileName} fileExtension={'.xls'} >
                    {this.renderVBCSwitch(fileName)}
                </ExcelFile>
            );
        }

        // Download file:- Called when Apart from ZBC & VBC failed
        if (isFailedFlag && (fileName == 'RMSpecification' || fileName == 'Vendor' || fileName == 'Overhead' || fileName == 'Fuel')) {
            return (
                <ExcelFile hideElement={true} filename={fileName} fileExtension={'.xls'} >
                    {this.renderSwitch(fileName)}
                </ExcelFile>
            );
        }

        // Display Radio button with ZBC or VBC file download button 
        if (isZBCVBCTemplate) {
            return (
                <>
                    {costingHead == 'ZBC' ?

                        <ExcelFile filename={`${fileName}ZBC`} fileExtension={'.xls'} element={<button type="button" className={'btn btn-primary pull-right'}><img src={require('../../assests/images/download.png')}></img> Download ZBC</button>}>
                            {fileName ? this.renderZBCSwitch(fileName) : ''}
                        </ExcelFile>

                        :

                        <ExcelFile filename={`${fileName}VBC`} fileExtension={'.xls'} element={<button type="button" className={'btn btn-primary pull-right'}><img src={require('../../assests/images/download.png')}></img> Download VBC</button>}>
                            {fileName ? this.renderVBCSwitch(fileName) : ''}
                        </ExcelFile>

                    }
                </>
            );
        }

        // Display download button Apart from ZBC and VBC
        return (
            <ExcelFile filename={fileName} fileExtension={'.xls'} element={<button type="button" className={'btn btn-primary pull-right'}><img src={require('../../assests/images/download.png')}></img> Download File</button>}>
                {fileName ? this.renderSwitch(fileName) : ''}
            </ExcelFile>
        );
    }
}

export default Downloadxls;