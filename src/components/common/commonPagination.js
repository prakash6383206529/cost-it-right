import React from 'react';
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
            }
            if (isFilterEmpty) {
                thisReference.setState({ warningMessage: false })
            }
        }

    } else {

        if (value.column.colId === "EffectiveDate" || value.column.colId === "CreatedDate") {
            return false
        }
        thisReference.setState({ floatingFilterData: { ...thisReference.state.floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter } })
    }
}


export const onSearch = (gridOptions, thisReference, master) => {

    thisReference.setState({ warningMessage: false, isFilterButtonClicked: true, pageNo: 1, currentRowIndex: 0 })
    gridOptions?.columnApi?.resetColumnState();

    switch (master) {
        case "BOP":
            thisReference.getDataList("", 0, "", "", 0, 100, true, thisReference.state.floatingFilterData)
            break;
        case "Machine":
            thisReference.getDataList("", 0, "", 0, "", "", 0, 100, true, thisReference.state.floatingFilterData)
            break;
        case "Operation":
            thisReference.getTableListData(null, null, null, null, 0, 100, true, thisReference.state.floatingFilterData)
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
        if (prop !== "DepartmentCode") {
            obj[prop] = ""
        }
    }

    thisReference.setState({ floatingFilterData: obj, warningMessage: false, pageNo: 1, currentRowIndex: 0 })

    switch (master) {
        case "BOP":
            thisReference.getDataList("", 0, "", "", 0, 100, true, thisReference.state.floatingFilterData)
            break;
        case "Machine":
            thisReference.getDataList("", 0, "", 0, "", "", 0, 100, true, thisReference.state.floatingFilterData)
            break;
        case "Operation":
            thisReference.getTableListData(null, null, null, null, 0, 100, true, thisReference.state.floatingFilterData)
            break;

        default:

    }

}


export const onBtPrevious = (thisReference, master) => {
    if (thisReference.state.currentRowIndex >= 10) {

        thisReference.setState({ pageNo: thisReference.state.pageNo - 1 })
        const previousNo = thisReference.state.currentRowIndex - 10;

        switch (master) {
            case "BOP":
                thisReference.getDataList("", 0, "", "", previousNo, 100, true, thisReference.state.floatingFilterData)
                break;
            case "Machine":
                thisReference.getDataList("", 0, "", 0, "", "", previousNo, 100, true, thisReference.state.floatingFilterData)
                break;
            case "Operation":
                thisReference.getTableListData(null, null, null, null, previousNo, 100, true, thisReference.state.floatingFilterData)
                break;

            default:

        }
        thisReference.setState({ currentRowIndex: previousNo })

    }
}



export const onBtNext = (thisReference, master) => {
    if (thisReference.state.currentRowIndex < (thisReference.state.totalRecordCount - 10)) {

        thisReference.setState({ pageNo: thisReference.state.pageNo + 1 })
        const nextNo = thisReference.state.currentRowIndex + 10;

        switch (master) {
            case "BOP":
                thisReference.getDataList("", 0, "", "", nextNo, 100, true, thisReference.state.floatingFilterData)
                break;
            case "Machine":
                thisReference.getDataList("", 0, "", 0, "", "", nextNo, 100, true, thisReference.state.floatingFilterData)
                break;
            case "Operation":
                thisReference.getTableListData(null, null, null, null, nextNo, 100, true, thisReference.state.floatingFilterData)
                break;

            default:
        }

        thisReference.setState({ currentRowIndex: nextNo })
    }
};



export const onPageSizeChanged = (thisReference, newPageSize) => {

    thisReference.state.gridApi.paginationSetPageSize(Number(newPageSize));

    if (Number(newPageSize) === 10) {
        thisReference.setState({ pageSize: { pageSize10: true, pageSize50: false, pageSize100: false } })
    }
    else if (Number(newPageSize) === 50) {
        thisReference.setState({ pageSize: { pageSize10: false, pageSize50: true, pageSize100: false } })
    }
    else if (Number(newPageSize) === 100) {
        thisReference.setState({ pageSize: { pageSize10: false, pageSize50: false, pageSize100: true } })

    }

}
export function PaginationWrapper(props) {
    const onPageSizeChangedCommon = (newPageSize) => {
        props.setPage(newPageSize)
    }

    return (
        <div className="paging-container d-inline-block float-right">
            <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChangedCommon(e.target.value)} id="page-size">
                <option value={props.pageSize1 ? props.pageSize1 : 10} selected={true}>{props?.pageSize1 ? props?.pageSize1 : 10}</option>
                <option value={props?.pageSize2 ? props?.pageSize2 : 50}>{props?.pageSize2 ? props?.pageSize2 : 50}</option>
                <option value={props?.pageSize3 ? props?.pageSize3 : 100}>{props?.pageSize3 ? props?.pageSize3 : 100}</option>
            </select>
        </div>
    )
}