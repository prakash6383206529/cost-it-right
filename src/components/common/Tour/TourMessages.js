import React from 'react';
export function Steps(t, config) {
    let filterButton = true
    let addButton = true
    let bulkUpload = true
    let downloadButton = true
    let addLimit = true
    let viewButton = true
    let EditButton = true
    let DeleteButton = true
    let costMovementButton = true
    let copyButton = true
    let viewBOM = true
    let status = true
    let updateAssociatedTechnology = true
    let addAssociation = true
    let addMaterial = true
    let generateReport = true
    let approve = true
    let reject = true
    let multipleFilter = true
    let showcostingDetail = false
    let searchFilter = true
    let showRfqDetail = false
    let Cancel = false
    let viewProcessGroup = false
    let viewUserDetails = false
    if (config) {
        filterButton = config.filterButton !== undefined ? config.filterButton : true;
        addButton = config.addButton !== undefined ? config.addButton : true;
        bulkUpload = config.bulkUpload !== undefined ? config.bulkUpload : true;
        downloadButton = config.downloadButton !== undefined ? config.downloadButton : true;
        addLimit = config.addLimit !== undefined ? config.addLimit : true;
        viewButton = config.viewButton !== undefined ? config.viewButton : true;
        EditButton = config.EditButton !== undefined ? config.EditButton : true;
        DeleteButton = config.DeleteButton !== undefined ? config.DeleteButton : true;
        costMovementButton = config.costMovementButton !== undefined ? config.costMovementButton : true;
        copyButton = config.copyButton !== undefined ? config.copyButton : true;
        viewBOM = config.viewBOM !== undefined ? config.viewBOM : true;
        status = config.status !== undefined ? config.status : true;
        updateAssociatedTechnology = config.updateAssociatedTechnology !== undefined ? config.updateAssociatedTechnology : true;
        addAssociation = config.addAssociation !== undefined ? config.addAssociation : true;
        addMaterial = config.addMaterial !== undefined ? config.addMaterial : true;
        generateReport = config.generateReport !== undefined ? config.generateReport : true;
        approve = config.approve !== undefined ? config.approve : true;
        reject = config.reject !== undefined ? config.reject : true;
        multipleFilter = config.multipleFilter !== undefined ? config.multipleFilter : true;
        showcostingDetail = config.showcostingDetail !== undefined ? config.showcostingDetail : false;
        searchFilter = config.searchFilter !== undefined ? config.searchFilter : true;
        showRfqDetail = config.showRfqDetail !== undefined ? config.showRfqDetail : false;
        Cancel = config.Cancel !== undefined ? config.Cancel : false;
        viewProcessGroup = config.viewProcessGroup !== undefined ? config.viewProcessGroup : false;
        viewUserDetails = config.viewUserDetails !== undefined ? config.viewUserDetails : false;

    }
    return {
        SHOWCASE_TABLE: [
            {
                element: "#filter-text-box",
                intro: t("download"),
            },
            {
                element: ".showcase-container .ag-text-field-input",
                intro: t("download"),
            },
            {
                element: ".showcase-container .ag-floating-filter-button",
                intro: t("download"),
            },
            {
                element: ".showcase-container .has-checkbox .ag-checkbox",
                intro: t("download"),
            },
            {
                element: ".showcase-container #link_0",
                intro: t("download"),
            },
            {
                element: "#showcase_download",
                intro: t("download"),
            },
            {
                element: "#showcase_add",
                intro: t("_add"),
            },
            {
                element: "#showcase_refresh",
                intro: t("refresh"),
            },
        ],
        COMMON_LISTING: [
            ...(searchFilter ? [
                {
                    element: "#filter-text-box",
                    intro: t("showcaseTable.static.globalSearch"),
                },
            ] : []),
            {
                element: " .ag-text-field-input",
                intro: t("showcaseTable.static.floatingFilterInput"),
            },
            // ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper
            // ag-input-field-input ag-checkbox-input
            //ag-labeled ag-label-align-right ag-checkbox ag-input-field
            // {
            //     element: "#Machine_checkBox1",
            //     intro: t("showcaseTable.static.checkBox"),
            // },
            ...(viewUserDetails ? [
                {
                    element: "#view_details",
                    intro: t("showcaseTable.master_Listing_Tour.view_details"),
                },
            ] : []),
            ...(multipleFilter ? [
                {
                    element: ".ag-floating-filter-button",
                    intro: t("showcaseTable.static.floatingFilterButton"),
                },
            ] : []),
            ...(showcostingDetail ? [
                {
                    element: "#showcosting_detail",
                    intro: t("showcaseTable.master_Listing_Tour.costing_version"),
                },
            ] : []),
            ...(showRfqDetail ? [
                {
                    element: "#showRfq_detail",
                    intro: t("showcaseTable.master_Listing_Tour.rfq_version"),
                },
            ] : []),
            ...(filterButton ? [
                {
                    element: ".Tour_List_Filter", // Assuming filter button has this class
                    intro: t("showcaseTable.master_Listing_Tour.filterData"),
                },
            ] : []),
            ...(updateAssociatedTechnology ? [
                {
                    element: ".Tour_List_Update_Associated_Technology",
                    intro: t("showcaseTable.actionButton.updateAssociatedTechnology"),
                },
            ] : []),
            ...(addAssociation ? [
                {
                    element: ".Tour_List_AddAssociation",
                    intro: t("showcaseTable.actionButton.addAssociation"),
                },
            ] : []),
            ...(addMaterial ? [
                {
                    element: ".Tour_List_AddMaterial",
                    intro: t("showcaseTable.actionButton.addMaterial"),
                },
            ] : []),
            ...(addLimit ? [

                {
                    element: ".Tour_List_Limit",
                    intro: t("showcaseTable.master_Listing_Tour.addLimit"),
                },
            ] : []),
            ...(addButton ? [
                {
                    element: ".Tour_List_Add",
                    intro: t("showcaseTable.master_Listing_Tour.addButton"),
                },
            ] : []),
            ...(generateReport ? [
                {
                    element: ".Tour_List_GenerateReport",
                    intro: t("showcaseTable.master_Listing_Tour.generateReport"),
                }
            ] : []),

            ...(bulkUpload ? [
                {
                    element: ".Tour_List_BulkUpload",
                    intro: t("showcaseTable.master_Listing_Tour.uploadData"),
                }
            ] : []),
            ...(downloadButton ? [

                {
                    element: ".Tour_List_Download",
                    intro: t("showcaseTable.master_Listing_Tour.downloadData"),
                },
            ] : []),

            {
                element: ".Tour_List_Reset", // Assuming reset button has this class
                intro: t("showcaseTable.master_Listing_Tour.resetGrid"),
            },
            // ...(sapDownloadButton ? [

            //     {
            //         element: "#Excel-Download-sap",
            //         intro: t("showcaseTable.actionButton.sapDownload"),
            //     },
            // ] : []),
            // ...(encodedDownloadButton ? [

            //     {
            //         element: "#Excel-Download-sap-encoded",
            //         intro: t("showcaseTable.actionButton.encodedDownload"),
            //     },
            // ] : []),
            ...(costMovementButton ? [
                {
                    element: ".Tour_List_Cost_Movement",
                    intro: t("showcaseTable.actionButton.cost-movement"),
                },
            ] : []),
            ...(viewProcessGroup ? [
                {
                    element: ".Tour_List_Process_Group",
                    intro: t("showcaseTable.actionButton.viewProcessGroup"),
                },
            ] : []),
            ...(viewButton ? [
                {
                    element: ".Tour_List_View",
                    intro: t("showcaseTable.actionButton.view"),
                },
            ] : []),
            ...(EditButton ? [
                {
                    element: ".Tour_List_Edit",
                    intro: t("showcaseTable.actionButton.edit"),
                },
            ] : []),
            ...(DeleteButton ? [
                {
                    element: ".Tour_List_Delete",
                    intro: t("showcaseTable.actionButton.delete"),
                },
            ] : []),
            ...(Cancel ? [
                {
                    element: ".Tour_List_Cancel",
                    intro: t("showcaseTable.actionButton.cancel"),
                },
            ] : []),

            ...(copyButton ? [
                {
                    element: ".Tour_List_Copy",
                    intro: t("showcaseTable.actionButton.copy"),
                },
            ] : []),

            ...(viewBOM ? [
                {
                    element: ".Tour_List_View_BOM",
                    intro: t("showcaseTable.actionButton.viewBOM"),
                },
            ] : []),
            ...(status ? [
                {
                    element: ".Tour_List_Status",
                    intro: t("showcaseTable.actionButton.status"),
                    position: "left"
                },
            ] : []),
            ...(approve ? [
                {
                    element: ".Tour_List_Approve",
                    intro: t("showcaseTable.actionButton.approve"),
                },
            ] : []),
            ...(reject ? [
                {
                    element: ".Tour_List_Reject",
                    intro: t("showcaseTable.actionButton.reject"),
                },
            ] : []),


        ]

    }
}

