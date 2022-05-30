export var onFloatingFilterChanged = (value, gridOptions, thiss) => {

    const model = gridOptions?.api?.getFilterModel();
    thiss.setState({ filterModel: model })

    if (!thiss.state.isFilterButtonClicked) {
        thiss.setState({ warningMessage: true })
    }

    if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
        thiss.setState({ warningMessage: false })

    } else {

        if (value.column.colId === "EffectiveDate" || value.column.colId === "CreatedDate") {
            thiss.setState({ isSearchButtonDisable: false })
            return false
        }
        thiss.setState({ floatingFilterData: { ...thiss.state.floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter } })
        thiss.setState({ isSearchButtonDisable: false })

    }
}


export var onSearch = (gridOptions, thiss, master) => {

    thiss.setState({ warningMessage: false, isFilterButtonClicked: true, pageNo: 1, currentRowIndex: 0 })
    gridOptions?.columnApi?.resetColumnState();

    switch (master) {
        case "BOP":
            thiss.getDataList("", 0, "", "", 0, 100, true, thiss.state.floatingFilterData)
            break;
        case "Machine":
            thiss.getDataList("", 0, "", 0, "", "", 0, 100, true, thiss.state.floatingFilterData)
            break;
        case "Operation":
            thiss.getTableListData(null, null, null, null, 0, 100, true, thiss.state.floatingFilterData)
            break;
        default:

    }
}


export var resetState = (gridOptions, thiss, master) => {

    thiss.setState({ isFilterButtonClicked: false })
    gridOptions?.columnApi?.resetColumnState(null);
    gridOptions?.api?.setFilterModel(null);
    var obj = thiss.state.floatingFilterData

    for (var prop in obj) {
        obj[prop] = ""
    }

    thiss.setState({ floatingFilterData: obj, warningMessage: false, pageNo: 1, currentRowIndex: 0 })

    switch (master) {
        case "BOP":
            thiss.getDataList("", 0, "", "", 0, 100, true, thiss.state.floatingFilterData)
            break;
        case "Machine":
            thiss.getDataList("", 0, "", 0, "", "", 0, 100, true, thiss.state.floatingFilterData)
            break;
        case "Operation":
            thiss.getTableListData(null, null, null, null, 0, 100, true, thiss.state.floatingFilterData)
            break;

        default:

    }

}


export var onBtPrevious = (thiss, master) => {
    if (thiss.state.currentRowIndex >= 10) {

        thiss.setState({ pageNo: thiss.state.pageNo - 1 })
        const previousNo = thiss.state.currentRowIndex - 10;

        switch (master) {
            case "BOP":
                thiss.getDataList("", 0, "", "", previousNo, 100, true, thiss.state.floatingFilterData)
                break;
            case "Machine":
                thiss.getDataList("", 0, "", 0, "", "", previousNo, 100, true, thiss.state.floatingFilterData)
                break;
            case "Operation":
                thiss.getTableListData(null, null, null, null, previousNo, 100, true, thiss.state.floatingFilterData)
                break;

            default:

        }
        thiss.setState({ currentRowIndex: previousNo })

    }
}



export var onBtNext = (thiss, master) => {
    if (thiss.state.currentRowIndex < (thiss.state.totalRecordCount - 10)) {

        thiss.setState({ pageNo: thiss.state.pageNo + 1 })
        const nextNo = thiss.state.currentRowIndex + 10;

        switch (master) {
            case "BOP":
                thiss.getDataList("", 0, "", "", nextNo, 100, true, thiss.state.floatingFilterData)
                break;
            case "Machine":
                thiss.getDataList("", 0, "", 0, "", "", nextNo, 100, true, thiss.state.floatingFilterData)
                break;
            case "Operation":
                thiss.getTableListData(null, null, null, null, nextNo, 100, true, thiss.state.floatingFilterData)
                break;

            default:
        }

        thiss.setState({ currentRowIndex: nextNo })
    }
};
