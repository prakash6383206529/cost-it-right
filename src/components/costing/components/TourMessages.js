import React from 'react';

export function Steps(t, costingType) {
    return {

        COSTING_INITIAL: [
            {
                element: ".input-container #Technology_container",
                intro: t("costingInitial.Technology"),
            },
            {
                element: ".input-container #PartType_container",
                intro: t("costingInitial.PartType"),
            },
            {
                element: ".input-container #Part_container",
                intro: t("costingInitial.Part"),
            },
            {
                element: "#costing-cancel",
                intro: t("costingInitial.clear"),
                position: "left"
            },
        ],
        COSTING_STEP_TWO: [
            {
                element: "#ZBC_Costing_Add_Plant",
                intro: t("costingStepTwo.Technology"),
                position: "left"
            },
            {
                element: "#NCC_Costing_Add_Vendor",
                intro: t("costingStepTwo.Technology"),
                position: "left"
            },
            {
                element: "#VBC_Costing_Add_Vendor",
                intro: t("costingStepTwo.Technology"),
                position: "left"
            },
            {
                element: "#CBC_Costing_Add_Customer",
                intro: t("costingStepTwo.Technology"),
                position: "left"
            },
            {
                element: "#WAC_Costing_Add_Plant",
                intro: t("costingStepTwo.Technology"),
                position: "left"
            },
        ],
        VENDOR_COSTING_GRID: [
            {
                element: `.costing-table-${costingType} .edit-sob-btn`,
                intro: t("vendorCreateCosting.editSob"),
            },
            {
                element: `.costing-table-${costingType} .Costing-version-0`,
                intro: t("vendorCreateCosting.version"),
            },
            {
                element: `.costing-table-${costingType} .Add-file`,
                intro: t("vendorCreateCosting.createCosting"),
            },
            {
                element: `.costing-table-${costingType} .View`,
                intro: t("vendorCreateCosting.viewCosting"),
            },
            {
                element: `.costing-table-${costingType} .Edit`,
                intro: t("vendorCreateCosting.editCosting"),
            },
            {
                element: `.costing-table-${costingType} .Copy`,
                intro: t("vendorCreateCosting.copyCosting"),
            },
            {
                element: `.costing-table-${costingType} .Delete`,
                intro: t("vendorCreateCosting.deleteCosting"),
            },
            {
                element: `.costing-table-${costingType} .CancelIcon`,
                intro: t("vendorCreateCosting.discard"),
            },
        ]

    }
}
