import { reactLocalStorage } from "reactjs-localstorage";
import { showBopLabel } from "../../../helper";

export function Steps(t, config) {
    const showSendForApprovalButton = config?.showSendForApproval !== undefined && config?.showSendForApproval === true
    const introWithBOPDynamicValue = (intro) => intro.replace(/bop|BOP/gi, showBopLabel());
    const introMessage = (config && config.isEditFlag === false) ? t("DynamicActionControl.save_Button") : t("DynamicActionControl.update_Button");
    const EffectiveDate = (config && config.isEditFlag === false) ? t("bopDomesticForm.AddBOPDomestic_EffectiveDate") : t("bopDomesticForm.AddBOPDomestic_Edit_EffectiveDate");
    const BasicRate = (config && config.isEditFlag === false) ? t("bopDomesticForm.AddBOPDomestic_BasicRateBase") : t("bopDomesticForm.AddBOPDomestic_Edit_BasicRateBaseCurrency");
    return {
        BOP_DOMESTIC_FORM: [
            ...(!(config && config.isEditFlag === true)) ? [
                {
                    element: "#bop_form_zero_based",
                    intro: t("bopDomesticForm.bop_form_zero_based"),
                },
                {
                    element: "#bop_form_vendor_based",
                    intro: t("bopDomesticForm.bop_form_vendor_based"),
                },
                ...(reactLocalStorage.getObject('CostingTypePermission').cbc ? [{
                    element: "#bop_form_customer_based",
                    intro: t("bopDomesticForm.bop_form_customer_based"),
                }] : []),
                {
                    element: "#bop_part_name_form_zero_based",
                    intro: introWithBOPDynamicValue(t("bopDomesticForm.bop_part_name_form_zero_based")),
                },
                {
                    element: "#AddBOPDomestic_BOPCategory_container",
                    intro: introWithBOPDynamicValue(t("bopDomesticForm.AddBOPDomestic_BOPCategory_container")),
                },
                ...config && config?.isEditFlag === false ? [
                    {
                        element: "#addBOPDomestic_categoryToggle",
                        intro: t("bopDomesticForm.addBOPDomestic_categoryToggle"),
                    }
                ] : [],

                {
                    element: "#bop_part_number_form_zero_based",
                    intro: introWithBOPDynamicValue(t("bopDomesticForm.bop_part_number_form_zero_based")),
                },
                {
                    element: "#bop_specification_form_zero_based",
                    intro: introWithBOPDynamicValue(t("bopDomesticForm.bop_specification_form_zero_based")),
                },
                {
                    element: "#AddBOPDomestic_UOM_container",
                    intro: t("bopDomesticForm.AddBOPDomestic_UOM_container"),
                },
                {
                    element: "#AddBOPDomestic_Plant_container",
                    intro: t("bopDomesticForm.AddBOPDomestic_Plant_container"),
                },
                ...config && config.CBCTypeField ? [
                    {
                        element: "#AddBOPDomestic_clientName_container",
                        intro: t("bopDomesticForm.AddBOPDomestic_Customer_container"),
                    },
                ] : [],
                ...(!(config && config.CBCTypeField) ? [
                    {
                        element: "#bop_vendor_name_form_zero_based",
                        intro: t("bopDomesticForm.bop_vendor_name_form_zero_based"),
                    },
                    ...config && config?.isEditFlag === false ? [
                        {
                            element: "#addBOPDomestic_vendorToggle",
                            intro: t("bopDomesticForm.addBOPDomestic_vendorToggle"),
                        }
                    ] : [],

                ] : []),
                ...config && config.sourceField ? [{
                    element: "#AddBOPDomestic_Source",
                    intro: t("bopDomesticForm.AddBOPDomestic_Source"),
                },
                {
                    element: "#AddBOPDomestic_SourceLocation_container",
                    intro: t("bopDomesticForm.AddBOPDomestic_SourceLocation_container"),
                }
                ] : [],
            ] : [],
            ...(config && config?.isBOPAssociated === false) || (config && config?.isEditFlag === false) ? [
                {
                    element: "#AddBOPDomestic_EffectiveDate",
                    intro: EffectiveDate,
                },
                {
                    element: "#AddBOPDomestic_NumberOfPieces",
                    intro: t("bopDomesticForm.AddBOPDomestic_NumberOfPieces"),
                },
                {
                    element: "#AddBOPDomestic_BasicRateBase",
                    intro: BasicRate,
                },
                ...config && config.conditionCost ? [
                    {
                        element: "#addBOPDomestic_condition",
                        intro: t("bopDomesticForm.addBOPDomestic_condition"),
                    },
                ] : [],
            ] : [],
            {
                element: "#AddBOPDomestic_Remark",
                intro: t("bopDomesticForm.AddBOPDomestic_Remark"),
            },
            {
                element: "#bop_file_upload_form_zero_based",
                intro: t("bopDomesticForm.bop_file_upload_form_zero_based"),
            },
            {
                element: "#AddBOPDomestic_cancel",
                intro: introWithBOPDynamicValue(t("bopDomesticForm.AddBOPDomestic_cancel")),
            },
            ...((showSendForApprovalButton === false) ? [
                {
                    element: "#AddBOPDomestic_updateSave",
                    intro: introMessage,
                },
            ] : []),

            ...((showSendForApprovalButton === true) ? [

                {
                    element: "#AddBOPDomestic_sendForApproval",
                    intro: introWithBOPDynamicValue(t("bopDomesticForm.AddBOPDomestic_sendForApproval")),
                }
            ] : []),
        ],
        BOP_IMPORT_FORM: [
            ...(!(config && config.isEditFlag === true)) ? [
                {
                    element: "#bop_import_zeroBased",
                    intro: t("bopImportForm.bop_import_zeroBased"),
                },
                {
                    element: "#bop_import_vendor_based",
                    intro: t("bopImportForm.bop_import_vendor_based"),
                },
                ...(reactLocalStorage.getObject('CostingTypePermission').cbc ? [{
                    element: "#bop_import_customer_based",
                    intro: t("bopImportForm.bop_import_customer_based"),
                }] : []),
                {
                    element: "#AddBOPImport_BoughtOutPartName",
                    intro: introWithBOPDynamicValue(t("bopImportForm.AddBOPImport_BoughtOutPartName")),
                },
                {
                    element: "#AddBOPImport_BOPCategory_container",
                    intro: introWithBOPDynamicValue(t("bopImportForm.AddBOPImport_BOPCategory_container")),
                },
                ...config && config?.isEditFlag === false ? [
                    {
                        element: "#addBOPImport_categoryToggle",
                        intro: t("bopImportForm.addBOPImport_categoryToggle"),
                    }] : [],
                {
                    element: "#AddBOPImport_BoughtOutPartNumber",
                    intro: introWithBOPDynamicValue(t("bopImportForm.AddBOPImport_BoughtOutPartNumber")),
                },
                {
                    element: "#AddBOPImport_Specification",
                    intro: introWithBOPDynamicValue(t("bopImportForm.AddBOPImport_Specification")),
                },
                {
                    element: "#AddBOPImport_UOM_container",
                    intro: t("bopImportForm.AddBOPImport_UOM_container"),
                },
                {
                    element: "#AddBOPImport_Plant_container",
                    intro: t("bopImportForm.AddBOPImport_Plant_container"),
                },
                ...config && config.CBCTypeField ? [
                    {
                        element: "#AddBOPImport_clientName_container",
                        intro: t("bopImportForm.AddBOPImport_Customer_container"),
                    },
                ] : [],
                ...(!(config && config.CBCTypeField) ? [

                    {
                        element: "#AddBOPImport_BOPVendoreName",
                        intro: t("bopImportForm.AddBOPImport_BOPVendoreName"),
                    },
                    ...config && config?.isEditFlag === false ? [
                        {
                            element: "#addBOPImport_vendorToggle",
                            intro: t("bopImportForm.addBOPImport_vendorToggle"),
                        },
                    ] : [],
                ] : []),
            ] : [],
            ...(config && config?.isBOPAssociated === false) || (config && config?.isEditFlag === false) ? [
                ...config && config.sourceField ? [{
                    element: "#AddBOPImport_Source",
                    intro: t("bopImportForm.AddBOPImport_Source"),
                },
                {
                    element: "#AddBOPImport_SourceLocation_container",
                    intro: t("bopImportForm.AddBOPImport_SourceLocation_container"),
                },

                {
                    element: "#AddBOPImport_incoTerms_container",
                    intro: t("bopImportForm.AddBOPImport_incoTerms_container"),
                },
                {
                    element: "#AddBOPImport_paymentTerms_container",
                    intro: t("bopImportForm.paymentTerm"),
                },
                {
                    element: "#AddBOPImport_Currency_container",
                    intro: t("bopImportForm.AddBOPImport_Currency_container"),
                },
                ] : [],
            ] : [],
            ...(config && config?.isBOPAssociated === false) || (config && config?.isEditFlag === false) ? [
                {
                    element: "#AddBOPImport_EffectiveDate",
                    intro: EffectiveDate,
                },
                {
                    element: "#AddBOPImport_NumberOfPieces",
                    intro: t("bopImportForm.AddBOPImport_NumberOfPieces"),
                },
                {
                    element: "#AddBOPImport_BasicRateSelectedCurrency",
                    intro: BasicRate,
                },
            ] : [],

            {
                element: "#AddBOPImport_Remark",
                intro: t("bopImportForm.AddBOPImport_Remark"),
            },
            {
                element: "#AddBOPImport_FileUpload",
                intro: t("bopImportForm.AddBOPImport_FileUpload"),
            },
            {
                element: "#addBOPIMport_cancel",
                intro: introWithBOPDynamicValue(t("bopImportForm.addBOPIMport_cancel")),
            },
            ...((showSendForApprovalButton === false) ? [

                {
                    element: "#addBOPIMport_save",
                    intro: introMessage
                },
            ] : []),
            ...((showSendForApprovalButton === true) ? [
                {
                    element: "#addBOPIMport_sendForApproval",
                    intro: introWithBOPDynamicValue(t("bopImportForm.addBOPIMport_sendForApproval")),
                },
            ] : []),
        ],
        BOP_DOMESTIC_CATEGORY_FORM: [
            {
                element: "#AddBOPCategory_Category",
                intro: t("bopDomesticCategoryForm.AddBOPCategory_Category"),
            },
            {
                element: "#AddBOPDomesticCategory_Cancel",
                intro: introWithBOPDynamicValue(t("bopDomesticCategoryForm.AddBOPDomesticCategory_Cancel")),
            },
            {
                element: "#AddBOPDomesticCategory_Save",
                intro: introMessage,
            }
        ],
    }
}