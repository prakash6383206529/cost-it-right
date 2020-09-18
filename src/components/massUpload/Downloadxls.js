import React from "react";
import ReactExport from 'react-export-excel';
import {
    Fuel, FuelTempData,
    RMDomesticZBC, RMDomesticZBCTempData, RMDomesticVBC, RMDomesticVBCTempData,
    RMImportZBC, RMImportZBCTempData, RMImportVBC, RMImportVBCTempData,
    RMSpecification, RMSpecificationXLTempData,
    Vendor, VendorTempData,
    Labour, LabourTempData,
    Overhead, OverheadTempData, Profit, ProfitTempData,
    ZBCOperation, ZBCOperationTempData, VBCOperation, VBCOperationTempData,
    MachineZBC, MachineZBCTempData, MachineVBC, MachineVBCTempData, MHRMoreZBC, MHRMoreZBCTempData,
    Bought_Out_Parts, OtherOperation,
} from '../../config/masterData';
import { checkVendorPlantConfigurable } from "../../helper";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class Downloadxls extends React.Component {

    /**
    * @method checkVendorPlantConfig
    * @description CONDITION TO CHECK:- TO AVOID VENDOR PLANT IF NOT CONFIGURABLE FROM INITIALIZER
    */
    checkVendorPlantConfig = (excelData) => {
        return excelData.filter((el) => {
            if (checkVendorPlantConfigurable() === false) {
                if (el.value === 'VendorPlant') return false;
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
            case 'Labour':
                return this.returnExcelColumn(Labour, LabourTempData);
            case 'BOP':
                return this.returnExcelColumn(Bought_Out_Parts);
            case 'OtherOperation':
                return this.returnExcelColumn(OtherOperation);
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
            case 'Machine':
                return this.returnExcelColumn(MachineZBC, MachineZBCTempData);
            case 'ZBC_MACHINE_MORE':
                return this.returnExcelColumn(MHRMoreZBC, MHRMoreZBCTempData);
            case 'BOP':
                return this.returnExcelColumn(Bought_Out_Parts);
            case 'OtherOperation':
                return this.returnExcelColumn(OtherOperation);
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
                return this.returnExcelColumn(this.checkVendorPlantConfig(VBCOperation), VBCOperationTempData);
            case 'Machine':
                return this.returnExcelColumn(this.checkVendorPlantConfig(MachineVBC), MachineVBCTempData);
            case 'BOP':
                return this.returnExcelColumn(Bought_Out_Parts);
            case 'OtherOperation':
                return this.returnExcelColumn(OtherOperation);
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

            //BELOW CONDITION TO ADD 'REASON' COLUMN WHILE DOWNLOAD EXCEL SHEET IN CASE OF FAILED
            let isContentReason = data.filter(d => d.label === 'Reason')
            if (isContentReason.length === 0) {
                let addObj = { label: 'Reason', value: 'Reason' }
                data.push(addObj)
            }
        }

        return (<ExcelSheet data={isFailedFlag ? failedData : TempData} name={fileName}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.label} />)}
        </ExcelSheet>);
    }

    render() {
        const { isFailedFlag, fileName, isZBCVBCTemplate, isMachineMoreTemplate, costingHead } = this.props;

        // DOWNLOAD FILE:- CALLED WHEN ZBC FILE FAILED   hideElement={true}
        // ZBC_MACHINE_MORE THIS IS ADDITIONAL CONDITION ONLY FOR MACHINE MORE DETAIL FROM MACHINE MASTER
        if (isFailedFlag && (costingHead === 'ZBC' || costingHead === 'ZBC_MACHINE_MORE') && (fileName === 'RMDomestic' || fileName === 'RMImport' || fileName === 'Operation' || fileName === 'Machine')) {
            return (
                <ExcelFile hideElement={true} filename={`${fileName}ZBC`} fileExtension={'.xls'} >
                    {isMachineMoreTemplate ? this.renderZBCSwitch(costingHead) : this.renderZBCSwitch(fileName)}
                </ExcelFile>
            );
        }

        // DOWNLOAD FILE:- CALLED WHEN VBC FILE FAILED
        if (isFailedFlag && costingHead === 'VBC' && (fileName === 'RMDomestic' || fileName === 'RMImport' || fileName === 'Operation' || fileName === 'Machine')) {
            return (
                <ExcelFile hideElement={true} filename={`${fileName}VBC`} fileExtension={'.xls'} >
                    {this.renderVBCSwitch(fileName)}
                </ExcelFile>
            );
        }

        // DOWNLOAD FILE:- CALLED WHEN FILE FAILED APART FROM ZBC AND VBC
        if (isFailedFlag && (fileName === 'RMSpecification' || fileName === 'Vendor' || fileName === 'Overhead' || fileName === 'Fuel' || fileName === 'Labour')) {
            return (
                <ExcelFile hideElement={true} filename={fileName} fileExtension={'.xls'} >
                    {this.renderSwitch(fileName)}
                </ExcelFile>
            );
        }

        // DISPLAY RADIO BUTTON ZBC AND VBC, WITH FILE DOWNLOAD BUTTON
        if (isZBCVBCTemplate) {
            return (
                <>
                    {costingHead === 'ZBC' &&
                        <ExcelFile filename={`${fileName}ZBC`} fileExtension={'.xls'} element={<button type="button" className={'btn btn-primary pull-right'}><img alt={''} src={require('../../assests/images/download.png')}></img> Download ZBC</button>}>
                            {fileName ? this.renderZBCSwitch(fileName) : ''}
                        </ExcelFile>}

                    {costingHead === 'VBC' &&
                        <ExcelFile filename={`${fileName}VBC`} fileExtension={'.xls'} element={<button type="button" className={'btn btn-primary pull-right'}><img alt={''} src={require('../../assests/images/download.png')}></img> Download VBC</button>}>
                            {fileName ? this.renderVBCSwitch(fileName) : ''}
                        </ExcelFile>}

                    {/* ZBC_MACHINE_MORE THIS IS ADDITIONAL CONDITION ONLY FOR MACHINE MORE DETAIL FROM MACHINE MASTER */}
                    {costingHead === 'ZBC_MACHINE_MORE' &&
                        <ExcelFile filename={`MACHINE_MORE_ZBC`} fileExtension={'.xls'} element={<button type="button" className={'btn btn-primary pull-right'}><img alt={''} src={require('../../assests/images/download.png')}></img> Download ZBC DETAIL</button>}>
                            {fileName ? this.renderZBCSwitch(costingHead) : ''}
                        </ExcelFile>}
                </>
            );
        }

        // DISPLAY DOWNLOAD FILE BUTTON EXCEPT ZBC AND VBC TEMPLATES
        return (
            <ExcelFile filename={fileName} fileExtension={'.xls'} element={<button type="button" className={'btn btn-primary pull-right'}><img alt={''} src={require('../../assests/images/download.png')}></img> Download File</button>}>
                {fileName ? this.renderSwitch(fileName) : ''}
            </ExcelFile>
        );
    }
}

export default Downloadxls;