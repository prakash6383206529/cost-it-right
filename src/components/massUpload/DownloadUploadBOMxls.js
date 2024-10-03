import React from "react";
import ReactExport from 'react-export-excel';
import { BOMUpload, BOMUploadTempData } from '../../config/masterData';
import { getConfigurationKey } from "../../helper";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

export const checkSAPCodeinExcel = (excelData) => {
  return excelData.filter((el) => {
    if (getConfigurationKey().IsSAPCodeRequired === false) {
      if (el.value === 'SAPCode') return false;
    }
    return true;
  })
}

class DownloadUploadBOMxls extends React.Component {




  /**
  * @method renderSwitch
  * @description Switch case for different xls file head according to master
  */
  renderSwitch = (master) => {

    switch (master) {
      case 'BOM':
        return this.returnExcelColumn(checkSAPCodeinExcel(BOMUpload), checkSAPCodeinExcel(BOMUploadTempData));
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
    let dataList = [...data]
    if (isFailedFlag) {

      //BELOW CONDITION TO ADD 'REASON' COLUMN WHILE DOWNLOAD EXCEL SHEET IN CASE OF FAILED
      let isContentReason = dataList.filter(d => d.label === 'Reason')
      if (isContentReason.length === 0) {
        let addObj = { label: 'Reason', value: 'Reason' }
        dataList.push(addObj)
      }
    }

    return (<ExcelSheet data={isFailedFlag ? failedData : TempData} name={fileName}>
      {dataList && dataList.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.label} />)}
    </ExcelSheet>);
  }

  render() {
    const { isFailedFlag, fileName, } = this.props;

    // DOWNLOAD FILE:- CALLED WHEN FILE FAILED APART FROM ZBC AND VBC
    if (isFailedFlag && fileName === 'BOM') {
      return (
        <ExcelFile hideElement={true} filename={fileName} fileExtension={'.xls'} >
          {this.renderSwitch(fileName)}
        </ExcelFile>
      );
    }

    // DISPLAY DOWNLOAD FILE BUTTON EXCEPT ZBC AND VBC TEMPLATES
    return (
      <ExcelFile filename={fileName} fileExtension={'.xls'} element={<button type="button" className={'btn btn-primary pull-right w-100'}><div class="download"></div> Download File</button>}>
        {fileName ? this.renderSwitch(fileName) : ''}
      </ExcelFile>
    );
  }
}

export default DownloadUploadBOMxls;