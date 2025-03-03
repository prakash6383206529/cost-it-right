import React from 'react';
import { defaultPageSize } from '../../config/constants'
import { getConfigurationKey } from '../../helper';
export const onFloatingFilterChanged = (value, gridOptions, thisReference) => {

    const model = gridOptions?.api?.getFilterModel();
    thisReference.setState({ filterModel: model })

    if (!thisReference.state.isFilterButtonClicked) {
        thisReference.setState({ warningMessage: true })
    }

    if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
        let isFilterEmpty = true
        if (model !== undefined && model !== null) {
            if (Object.keys(model).length > 0) {
                isFilterEmpty = false
                for (var property in thisReference.state.floatingFilterData) {

                    if (property === value.column.colId) {
                        thisReference.state.floatingFilterData[property] = ""
                    }
                }

                thisReference.setState({ floatingFilterData: thisReference.state.floatingFilterData })
            }
            if (isFilterEmpty) {
                thisReference.setState({ warningMessage: false })
                for (var prop in thisReference.state.floatingFilterData) {

                    if (thisReference.props.isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {

                        if (prop !== "DepartmentName") {
                            thisReference.state.floatingFilterData[prop] = ""
                        }

                    } else {
                        thisReference.state.floatingFilterData[prop] = ""
                    }

                }
                thisReference.setState({ floatingFilterData: thisReference.state.floatingFilterData })
            }
        }

    } else {

        if (value.column.colId === "EffectiveDate" || value.column.colId === "CreatedDate") {
            return false
        }
        thisReference.setState({ floatingFilterData: { ...thisReference.state.floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter } })
    }
}


export const onSearch = (gridOptions, thisReference, master, globalTake) => {

    thisReference.setState({ warningMessage: false, isFilterButtonClicked: true, pageNo: 1, pageNoNew: 1, currentRowIndex: 0 })
    gridOptions?.columnApi?.resetColumnState();

    switch (master) {
        case "BOP":
            thisReference.getDataList("", 0, "", "", 0, globalTake, true, thisReference.state.floatingFilterData)
            break;
        case "Machine":
            thisReference.getDataList("", 0, "", 0, "", "", 0, globalTake, true, thisReference.state.floatingFilterData)
            break;
        case "Operation":
            thisReference.getTableListData(null, null, null, null, 0, globalTake, true, thisReference.state.floatingFilterData)
            break;
        case "Part":
            thisReference.ApiActionCreator(0, globalTake, thisReference.state.floatingFilterData, true)
            break;
        case "Vendor":
            thisReference.getTableListData(0, '', "", "", 100, thisReference.state.floatingFilterData, true)
            break;
        default:

    }
}


export const resetState = (gridOptions, thisReference, master) => {

    thisReference.setState({ isFilterButtonClicked: false })
    gridOptions?.columnApi?.resetColumnState(null);
    gridOptions?.api?.setFilterModel(null);
    var obj = thisReference.state.floatingFilterData

    for (var prop in obj) {
        if (thisReference.props.isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
            if (prop !== "DepartmentName") {
                obj[prop] = ""
            }
        } else {
            obj[prop] = ""
        }
    }

    thisReference.setState({ floatingFilterData: obj, warningMessage: false, pageNo: 1, pageNoNew: 1, currentRowIndex: 0 })
    if (thisReference?.props?.isSimulation) {
        thisReference.props.isReset()
    }

    switch (master) {
        case "BOP":
            thisReference.getDataList("", 0, "", "", 0, defaultPageSize, true, thisReference.state.floatingFilterData, true)
            break;
        case "Machine":
            thisReference.getDataList("", 0, "", 0, "", "", 0, defaultPageSize, true, thisReference.state.floatingFilterData)
            break;
        case "Operation":
            thisReference.getTableListData(null, null, null, null, 0, defaultPageSize, true, thisReference.state.floatingFilterData)
            break;
        case "Part":
            thisReference.ApiActionCreator(0, defaultPageSize, thisReference.state.floatingFilterData, true)
            break;
        case "Vendor":
            thisReference.getTableListData(0, '', "", "", defaultPageSize, thisReference.state.floatingFilterData, true)
            break;

        default:

    }
    thisReference.setState({ pageSize: { pageSize10: true, pageSize50: false, pageSize100: false }, globalTake: 10 })

}


export const onBtPrevious = (thisReference, master) => {

    if (thisReference.state.pageNo === 1) {
        return false
    }

    if (thisReference.state.currentRowIndex >= 10) {

        thisReference.setState({ pageNo: thisReference.state.pageNo - 1, pageNoNew: thisReference.state.pageNo - 1 })
        const previousNo = thisReference.state.currentRowIndex - 10;

        switch (master) {
            case "BOP":
                thisReference.getDataList("", 0, "", "", previousNo, thisReference.state.globalTake, true, thisReference.state.floatingFilterData)
                break;
            case "Machine":
                thisReference.getDataList("", 0, "", 0, "", "", previousNo, thisReference.state.globalTake, true, thisReference.state.floatingFilterData)
                break;
            case "Operation":
                thisReference.getTableListData(null, null, null, null, previousNo, thisReference.state.globalTake, true, thisReference.state.floatingFilterData)
                break;
            case "Part":
                thisReference.ApiActionCreator(previousNo, thisReference.state.globalTake, thisReference.state.floatingFilterData, true)
                break;
            case "Vendor":
                thisReference.getTableListData(previousNo, '', "", "", thisReference.state.globalTake, thisReference.state.floatingFilterData, true)
                break;

            default:

        }
        thisReference.setState({ currentRowIndex: previousNo })

    }
}



export const onBtNext = (thisReference, master) => {

    if (thisReference.state.pageSize.pageSize50 && thisReference.state.pageNo >= Math.ceil(thisReference.state.totalRecordCount / 50)) {
        return false
    }

    if (thisReference.state.pageSize.pageSize100 && thisReference.state.pageNo >= Math.ceil(thisReference.state.totalRecordCount / 100)) {
        return false
    }

    if (thisReference.state.currentRowIndex < (thisReference.state.totalRecordCount - 10)) {

        thisReference.setState({ pageNo: thisReference.state.pageNo + 1, pageNoNew: thisReference.state.pageNo + 1 })
        const nextNo = thisReference.state.currentRowIndex + 10;

        switch (master) {
            case "BOP":
                thisReference.getDataList("", 0, "", "", nextNo, thisReference.state.globalTake, true, thisReference.state.floatingFilterData)
                break;
            case "Machine":
                thisReference.getDataList("", 0, "", 0, "", "", nextNo, thisReference.state.globalTake, true, thisReference.state.floatingFilterData)
                break;
            case "Operation":
                thisReference.getTableListData(null, null, null, null, nextNo, thisReference.state.globalTake, true, thisReference.state.floatingFilterData)
                break;
            case "Part":
                thisReference.ApiActionCreator(nextNo, thisReference.state.globalTake, thisReference.state.floatingFilterData, true)
                break;
            case "Vendor":
                thisReference.getTableListData(nextNo, '', "", "", thisReference.state.globalTake, thisReference.state.floatingFilterData, true)
                break;

            default:
        }

        thisReference.setState({ currentRowIndex: nextNo })
    }
};



export const onPageSizeChanged = (thisReference, newPageSize, master, currentRowIndex) => {



    if (Number(newPageSize) === 10) {


        switch (master) {
            case "BOP":
                thisReference.getDataList("", 0, "", "", currentRowIndex, 10, true, thisReference.state.floatingFilterData)
                break;
            case "Machine":
                thisReference.getDataList("", 0, "", 0, "", "", currentRowIndex, 10, true, thisReference.state.floatingFilterData)
                break;
            case "Operation":
                thisReference.getTableListData(null, null, null, null, currentRowIndex, 10, true, thisReference.state.floatingFilterData)
                break;
            case "Part":
                thisReference.ApiActionCreator(currentRowIndex, 10, thisReference.state.floatingFilterData, true)
                break;
            case "Vendor":
                thisReference.getTableListData(currentRowIndex, '', "", "", 10, thisReference.state.floatingFilterData, true)
                break;


            default:
        }


        thisReference.setState({ pageSize: { pageSize10: true, pageSize50: false, pageSize100: false }, globalTake: 10, pageNo: thisReference.state.pageNoNew })

    }
    else if (Number(newPageSize) === 50) {

        switch (master) {
            case "BOP":
                thisReference.getDataList("", 0, "", "", currentRowIndex, 50, true, thisReference.state.floatingFilterData)
                // thisReference.setState({ pageNo: thisReference.state.pageNoNew })

                if (thisReference.state.pageNo >= Math.ceil(thisReference.state.totalRecordCount / 50)) {
                    thisReference.setState({ pageNo: Math.ceil(thisReference.state.totalRecordCount / 50) })
                    thisReference.getDataList("", 0, "", "", 0, 50, true, thisReference.state.floatingFilterData)
                }
                break;
            case "Machine":
                thisReference.getDataList("", 0, "", 0, "", "", currentRowIndex, 50, true, thisReference.state.floatingFilterData)

                if (thisReference.state.pageNo >= Math.ceil(thisReference.state.totalRecordCount / 50)) {
                    thisReference.setState({ pageNo: Math.ceil(thisReference.state.totalRecordCount / 50) })
                    thisReference.getDataList("", 0, "", 0, "", "", 0, 50, true, thisReference.state.floatingFilterData)
                }
                break;
            case "Operation":
                thisReference.getTableListData(null, null, null, null, currentRowIndex, 50, true, thisReference.state.floatingFilterData)

                if (thisReference.state.pageNo >= Math.ceil(thisReference.state.totalRecordCount / 50)) {
                    thisReference.setState({ pageNo: Math.ceil(thisReference.state.totalRecordCount / 50) })
                    thisReference.getTableListData(null, null, null, null, 0, 50, true, thisReference.state.floatingFilterData)
                }
                break;
            case "Part":
                thisReference.ApiActionCreator(currentRowIndex, 50, thisReference.state.floatingFilterData, true)

                if (thisReference.state.pageNo >= Math.ceil(thisReference.state.totalRecordCount / 50)) {
                    thisReference.setState({ pageNo: Math.ceil(thisReference.state.totalRecordCount / 50) })
                    thisReference.ApiActionCreator(0, 50, thisReference.state.floatingFilterData, true)
                }
                break;
            case "Vendor":
                thisReference.getTableListData(currentRowIndex, '', "", "", 50, thisReference.state.floatingFilterData, true)

                if (thisReference.state.pageNo >= Math.ceil(thisReference.state.totalRecordCount / 50)) {
                    thisReference.setState({ pageNo: Math.ceil(thisReference.state.totalRecordCount / 50) })
                    thisReference.getTableListData(0, '', "", "", 50, thisReference.state.floatingFilterData, true)
                }
                break;
            default:
        }

        thisReference.setState({ pageSize: { pageSize10: false, pageSize50: true, pageSize100: false }, globalTake: 50 })

        setTimeout(() => {
            thisReference.setState({ warningMessage: false })
        }, 1000);
    }
    else if (Number(newPageSize) === 100) {

        switch (master) {
            case "BOP":
                thisReference.getDataList("", 0, "", "", currentRowIndex, 100, true, thisReference.state.floatingFilterData)

                if (thisReference.state.pageNo >= Math.ceil(thisReference.state.totalRecordCount / 100)) {
                    thisReference.setState({ pageNo: Math.ceil(thisReference.state.totalRecordCount / 100) })
                    thisReference.getDataList("", 0, "", "", 0, 100, true, thisReference.state.floatingFilterData)
                }
                break;
            case "Machine":
                thisReference.getDataList("", 0, "", 0, "", "", currentRowIndex, 100, true, thisReference.state.floatingFilterData)

                if (thisReference.state.pageNo >= Math.ceil(thisReference.state.totalRecordCount / 100)) {
                    thisReference.setState({ pageNo: Math.ceil(thisReference.state.totalRecordCount / 100) })
                    thisReference.getDataList("", 0, "", 0, "", "", 0, 100, true, thisReference.state.floatingFilterData)
                }
                break;
            case "Operation":
                thisReference.getTableListData(null, null, null, null, currentRowIndex, 100, true, thisReference.state.floatingFilterData)

                if (thisReference.state.pageNo >= Math.ceil(thisReference.state.totalRecordCount / 100)) {
                    thisReference.setState({ pageNo: Math.ceil(thisReference.state.totalRecordCount / 100) })
                    thisReference.getTableListData(null, null, null, null, 0, 100, true, thisReference.state.floatingFilterData)
                }
                break;
            case "Part":
                thisReference.ApiActionCreator(currentRowIndex, 100, thisReference.state.floatingFilterData, true)

                if (thisReference.state.pageNo >= Math.ceil(thisReference.state.totalRecordCount / 100)) {
                    thisReference.setState({ pageNo: Math.ceil(thisReference.state.totalRecordCount / 100) })
                    thisReference.ApiActionCreator(0, 100, thisReference.state.floatingFilterData, true)
                }
                break;
            case "Vendor":
                thisReference.getTableListData(currentRowIndex, '', "", "", 100, thisReference.state.floatingFilterData, true)

                if (thisReference.state.pageNo >= Math.ceil(thisReference.state.totalRecordCount / 100)) {
                    thisReference.setState({ pageNo: Math.ceil(thisReference.state.totalRecordCount / 100) })
                    thisReference.getTableListData(0, '', "", "", 100, thisReference.state.floatingFilterData, true)
                }
                break;

            default:
        }


        thisReference.setState({ pageSize: { pageSize10: false, pageSize50: false, pageSize100: true }, globalTake: 100 })

        setTimeout(() => {
            thisReference.setState({ warningMessage: false })
        }, 1600);

    }
    thisReference.state.gridApi.paginationSetPageSize(Number(newPageSize));
}
export function PaginationWrapper(props) {

    const onPageSizeChangedCommon = (newPageSize) => {
        props.setPage(newPageSize)
    }

    return (
        <div className="paging-container d-inline-block float-right">
            <select className="form-control paging-dropdown" value={props?.globalTake} onChange={(e) => onPageSizeChangedCommon(e.target.value)} id="page-size">
                <option value={props.pageSize1 ? props.pageSize1 : 10} selected={true}>{props?.pageSize1 ? props?.pageSize1 : 10}</option>
                <option value={props?.pageSize2 ? props?.pageSize2 : 50}>{props?.pageSize2 ? props?.pageSize2 : 50}</option>
                <option value={props?.pageSize3 ? props?.pageSize3 : 100}>{props?.pageSize3 ? props?.pageSize3 : 100}</option>
            </select>
        </div>
    )
}