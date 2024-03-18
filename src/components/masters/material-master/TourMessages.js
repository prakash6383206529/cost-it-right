import { IsShowFreightAndShearingCostFields } from "../../../helper";
import { reactLocalStorage } from "reactjs-localstorage";

export function Steps(t, config) {
    const showSendForApprovalButton = config?.showSendForApproval !== undefined && config?.showSendForApproval === true


    // const initialConfiguration = useReducer(state => state.auth.initialConfiguration)
    return {
        RM_DOMESTIC_FORM: [
            ...(reactLocalStorage.getObject('CostingTypePermission').zbc ? [{


                element: "#rm_domestic_form_zero_based",
                intro: t(`form.form_zero_based`),
            }] : []),
            ...(reactLocalStorage.getObject('CostingTypePermission').vbc ? [{


                element: "#rm_domestic_form_vendor_based",
                intro: t(`form.form_vendor_based`),
            }] : []),

            ...(reactLocalStorage.getObject('CostingTypePermission').cbc ? [{
                element: "#rm_domestic_form_customer_based",
                intro: t(`form.form_customer_based`),
            }] : []),

            {
                element: "#AddRMDomestic_TechnologyId_container",
                intro: t("form.AddRMDomestic_TechnologyId_container"),
            },
            {
                element: "#AddRMDomestic_RawMaterialId_container",
                intro: t("form.AddRMDomestic_RawMaterialId_container"),
            },
            {
                element: "#addRMDomestic_RMToggle",
                intro: t("form.addRMDomestic_RMToggle"),
            },
            {
                element: "#AddRMDomestic_RawMaterialGradeId_container",
                intro: t("form.AddRMDomestic_RawMaterialGradeId_container"),
            },
            {
                element: "#AddRMDomestic_RawMaterialSpecificationId_container",
                intro: t("form.AddRMDomestic_RawMaterialSpecificationId_container"),
            },
            {
                element: "#AddRMDomestic_CategoryId_container",
                intro: t("form.AddRMDomestic_CategoryId_container"),
            },
            {
                element: "#AddRMDomestic_Code_container",
                intro: t("form.AddRMDomestic_Code_container"),
            },
            ...config && config.destinationField ? [
                {
                    element: "#AddRMDomestic_DestinationPlant_container",
                    intro: t("form.AddRMDomestic_DestinationLocation_container"),
                },
            ] : [],
            ...config && config.plantField ? [
                {
                    element: "#AddRMDomestic_DestinationPlant_container",
                    intro: t("form.AddRMDomestic_SourceSupplierPlantId_container"),
                },
            ] : [],

            ...config && config.CBCTypeField ? [
                {
                    element: "#AddRMDomestic_clientName_container",
                    intro: t("form.AddRMDomestic_Customer_container"),
                },
            ] : [],

            ...(!(config && config.CBCTypeField) ? [
                {
                    element: "#AddRMDomestic_Vendor",
                    intro: t("form.AddRMDomestic_Vendor"),
                },
                {
                    element: "#addRMDomestic_vendorToggle",
                    intro: t("form.addRMDomestic_vendorToggle"),
                },
            ] : []),

            ...config && config.hasSource ? [
                {
                    element: "#AddRMDomestic_HasDifferentSource",
                    intro: t("form.AddRMDomestic_HasDifferentSource"),
                }
            ] : [],
            ...config && config.sourceField ? [
                {
                    element: "#AddRMDomestic_Source",
                    intro: t("form.AddRMDomestic_Source"),
                },
                {
                    element: "#AddRMDomestic_SourceSupplierCityId_container",
                    intro: t("form.AddRMDomestic_SourceLocation"),
                }
            ] : [],
            {
                element: "#AddRMDomestic_UnitOfMeasurementId_container",
                intro: t("form.AddRMDomestic_UnitOfMeasurementId_container"),
            },
            {
                element: "#AddRMDomestic_cutOffPrice",
                intro: t("form.AddRMDomestic_cutOffPrice"),
            },
            {
                element: "#AddRMDomestic_BasicRateBaseCurrency",
                intro: t("form.AddRMDomestic_BasicRateBaseCurrency"),
            },
            ...IsShowFreightAndShearingCostFields() ? [
                {
                    element: "#AddRMDomestic_FreightCharge",
                    intro: t("form.AddRMDomestic_FreightCharge"),
                },
                {
                    element: "#AddRMDomestic_ShearingCost",
                    intro: t("form.AddRMDomestic_ShearingCost"),
                },
            ] : [],
            ...config && config.conditionCost ? [
                {
                    element: "#addRMDomestic_conditionToggle",
                    intro: t("form.addRMDomestic_conditionToggle"),
                },
            ] : [],

            {
                element: "#AddRMDomestic_EffectiveDate",
                intro: t("form.AddRMDomestic_EffectiveDate"),
            },
            {
                element: "#AddRMDomestic_Remark",
                intro: t("form.AddRMDomestic_Remark"),
            },
            {
                element: "#AddRMDomestic_uploadFiles",
                intro: t("form.AddRMDomestic_uploadFiles"),
                position: '',
            },
            {
                element: "#addRMDomestic_cancel",
                intro: t("form.addRMDomestic_cancel"),
            },
            ...((showSendForApprovalButton === false) ? [
                {
                    element: "#addRMDomestic_updateSave",
                    intro: t("form.addRMDomestic_save"),
                    position: 'left',
                },
            ] : []),
            ...((showSendForApprovalButton === true) ? [
                {
                    element: "#addRMDomestic_sendForApproval",
                    intro: t("form.addRMDomestic_sendForApproval"),
                    position: 'left',
                },
            ] : []),
        ],
        ADD_RAW_MATERIAL_SPEC: [
            {
                element: "#AddSpecification_RawMaterialName_container",
                intro: t("addRawMaterialSpecification.AddSpecification_RawMaterialName_container"),
            },
            {
                element: "#RawMaterialName-add",
                intro: t("addRawMaterialSpecification.RawMaterialName-add"),
            },
            {
                element: "#AddSpecification_GradeId_container",
                intro: t("addRawMaterialSpecification.AddSpecification_GradeId_container"),
            },
            {
                element: "#GradeId-add",
                intro: t("addRawMaterialSpecification.GradeIdAdd"),
            },
            {
                element: "#AddSpecification_Specification",
                intro: t("addRawMaterialSpecification.AddSpecification_Specification"),
            },
            {
                element: "#AddSpecification_Code",
                intro: t("addRawMaterialSpecification.AddSpecification_Specification"),
            },

            {
                element: "#rm-specification-cancel",
                intro: t("addRawMaterialSpecification.rm-specification-cancel"),
            },
            {
                element: "#rm-specification-submit",
                intro: t("addRawMaterialSpecification.rm-specification-submit"),
            },
        ],
        ADD_RAW_MATERIAL_IMPORT: [
            ...(reactLocalStorage.getObject('CostingTypePermission').zbc ? [{

                element: "#Add_rm_import_zero_based",
                intro: t("addRawMaterialImport.Add_rm_import_zero_based"),

            }] : []),
            ...(reactLocalStorage.getObject('CostingTypePermission').vbc ? [{

                element: "#Add_rm_import_vendor_based",
                intro: t("addRawMaterialImport.Add_rm_import_vendor_based"),
            }] : []),
            ...(reactLocalStorage.getObject('CostingTypePermission').cbc ? [{

                element: "#Add_rm_import_customer_based",
                intro: t("addRawMaterialImport.Add_rm_import_customer_based"),
            }] : []),
            {
                element: "#AddRMImport_TechnologyId_container",
                intro: t("addRawMaterialImport.AddRMImport_TechnologyId_container"),
            },
            {
                element: "#AddRMImport_RawMaterialId_container",
                intro: t("addRawMaterialImport.AddRMImport_RawMaterialId_container"),
            },
            {
                element: "#addRMImport_RMToggle",
                intro: t("addRawMaterialImport.addRMImport_RMToggle"),
            },

            {
                element: "#AddRMImport_RawMaterialGradeId_container",
                intro: t("addRawMaterialImport.AddRMImport_RawMaterialGradeId_container"),
            },
            {
                element: "#AddRMImport_RawMaterialSpecificationId_container",
                intro: t("addRawMaterialImport.AddRMImport_RawMaterialSpecificationId_container"),
            },
            {
                element: "#AddRMImport_CategoryId_container",
                intro: t("addRawMaterialImport.AddRMImport_CategoryId_container"),
            },
            {
                element: "#AddRMImport_Code_container",
                intro: t("addRawMaterialImport.AddRMImport_Code_container"),
            },
            ...config && config.plantField ? [
                {
                    element: "#AddRMImport_DestinationPlant_container",
                    intro: t("addRawMaterialImport.AddRMImport_SourceSupplierPlantId_container"),
                }
            ] : [],

            ...config && config.destinationField ? [
                {
                    element: "#AddRMImport_DestinationPlant_container",
                    intro: t("addRawMaterialImport.AddRMImport_DestinationPlant_container"),
                }
            ] : [],
            ...config && config.CBCTypeField ? [
                {
                    element: "#AddRMImport_clientName_container",
                    intro: t("form.AddRMDomestic_Customer_container"),
                },
            ] : [],
            ...config && config.hasSource ? [
                {
                    element: "#addRMImport_HasDifferentSource",
                    intro: t("addRawMaterialImport.addRMImport_HasDifferentSource"),
                }
            ] : [],
            ...(!(config && config.CBCTypeField) ? [
                {
                    element: "#AddRMImport_Vendor",
                    intro: t("addRawMaterialImport.AddRMImport_Vendor"),
                },
                {
                    element: "#addRMImport_vendorToggle",
                    intro: t("addRawMaterialImport.addRMImport_vendorToggle"),
                },
            ] : []),
            ...config && config.sourceField ? [
                {
                    element: "#AddRMImport_Source",
                    intro: t("addRawMaterialImport.addRMImport_sourceField"),
                },
                {
                    element: "#AddRMImport_SourceSupplierCityId_container",
                    intro: t("addRawMaterialImport.AddRMImport_SourceSupplierCityId_container"),
                }

            ] : [],
            {
                element: "#AddRMImport_UnitOfMeasurementId_container",
                intro: t("addRawMaterialImport.AddRMImport_UnitOfMeasurementId_container"),
            },
            {
                element: "#AddRMImport_Currency_container",
                intro: t("addRawMaterialImport.AddRMImport_Currency_container"),
            },
            {
                element: "#AddRMImport_EffectiveDate",
                intro: t("addRawMaterialImport.AddRMImport_EffectiveDate"),
            },
            {
                element: "#AddRMImport_cutOffPriceSelectedCurrency",
                intro: t("addRawMaterialImport.AddRMImport_cutOffPriceSelectedCurrency"),
            },
            {
                element: "#AddRMImport_BasicRateSelectedCurrency",
                intro: t("addRawMaterialImport.AddRMImport_BasicRateSelectedCurrency"),
            },
            ...IsShowFreightAndShearingCostFields() ? [
                {
                    element: "#AddRMImport_FreightChargeSelectedCurrency",
                    intro: t("addRawMaterialImport.AddRMImport_FreightChargeSelectedCurrency"),
                },
                {
                    element: "#AddRMImport_ShearingCostSelectedCurrency",
                    intro: t("addRawMaterialImport.AddRMImport_ShearingCostSelectedCurrency"),
                },
            ] : [],
            // ...(),
            {
                element: "#AddRMImport_Remark",
                intro: t("addRawMaterialImport.AddRMImport_Remark"),
            },
            {
                element: "#AddRMImport_UploadFiles",
                intro: t("addRawMaterialImport.AddRMImport_UploadFiles"),
            },
            {
                element: "#addRMImport_cancel",
                intro: t("addRawMaterialImport.addRMImport_cancel"),
            },
            ...((showSendForApprovalButton === false) ? [
                {
                    element: "#addRMImport_updateSave",
                    intro: t("addRawMaterialImport.addRMImport_save"),
                    position: 'left',
                },
            ] : []),
            ...((showSendForApprovalButton === true) ? [
                {
                    element: "#addRMImport_sendForApproval",
                    intro: t("addRawMaterialImport.addRMImport_sendForApproval"),
                    position: 'left',
                },
            ] : []),
        ],
        ADD_RM_ASSOCIATION: [
            {
                element: "#Association_RawMaterialName_container",
                intro: t("addRawMaterialAssociation.Association_RawMaterialName_container"),
            },
            {
                element: "#Association_GradeId_container",
                intro: t("addRawMaterialAssociation.Association_GradeId_container"),
            },
            {
                element: "#Association_MaterialTypeId_container",
                intro: t("addRawMaterialAssociation.Association_MaterialTypeId_container"),
            },
            {
                element: "#rmAssociation_cancel",
                intro: t("addRawMaterialAssociation.rmAssociation_cancel"),
            },
            {
                element: "#rmAssociation_Save",
                intro: t("addRawMaterialAssociation.rmAssociation_Save"),
            },
        ],
        ADD_MATERIAL: [
            {
                element: "#MaterialType_container",
                intro: t("addMaterial.AddMaterialType_MaterialType"),
            },
            {
                element: "#CalculatedDensityValue_container",
                intro: t("addMaterial.AddMaterialType_CalculatedDensityValue"),
            },
            {
                element: "#AddMaterialType_Cancel",
                intro: t("addMaterial.AddMaterialType_Cancel"),
            },
            {
                element: "#AddMaterialType_Save",
                intro: t("addMaterial.AddMaterialType_Save"),
            },
        ]
    }
}
