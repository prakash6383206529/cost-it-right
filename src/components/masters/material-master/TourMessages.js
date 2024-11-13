import { IsShowFreightAndShearingCostFields } from "../../../helper";
import { reactLocalStorage } from "reactjs-localstorage";

export function Steps(t, config) {
    const showSendForApprovalButton = config?.showSendForApproval !== undefined && config?.showSendForApproval === true
    const introMessage = (config && config.isEditFlag === false) ? t("DynamicActionControl.save_Button") : t("DynamicActionControl.update_Button");
    const EffectiveDate = (config && config.isEditFlag === false) ? t("form.AddRMDomestic_EffectiveDate") : t("form.AddRMDomestic_Edit_EffectiveDate");
    const BasicRate = (config && config.isEditFlag === false) ? t("form.AddRMDomestic_BasicRateBaseCurrency") : t("form.AddRMDomestic_Edit_BasicRateBaseCurrency");

    // const initialConfiguration = useReducer(state => state.auth.initialConfiguration)
    return {
        RM_DOMESTIC_FORM: [
            ...(!(config && config.isEditFlag === true)) ? [
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
                ...config && config?.isEditFlag === false ? [
                    {
                        element: "#addRMDomestic_RMToggle",
                        intro: t("form.addRMDomestic_RMToggle"),
                    }
                ] : [],

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
                    ...config && config?.isEditFlag === false ? [
                        {
                            element: "#addRMDomestic_vendorToggle",
                            intro: t("form.addRMDomestic_vendorToggle"),
                        },
                    ] : [],

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
            ] : [],
            ...(config && config?.isRMAssociated === false) || (config && config?.isEditFlag === false) ? [
                {
                    element: "#AddRMDomestic_cutOffPrice",
                    intro: t("form.AddRMDomestic_cutOffPrice"),
                },
                {
                    element: "#AddRMDomestic_BasicRateBaseCurrency",
                    intro: BasicRate,
                },
                ...config && config?.isEditFlag === true && config?.showCircleJali === false && config?.showScrap === true ? [
                    {
                        element: "#scrap-rate-base-currency",
                        intro: t("form.addRMDomestic_ScarapRate"),
                    },
                ] : [],

                ...config && config?.showCircleJali === true ? [
                    {
                        element: "#jali-scrap-cost-base-currency",
                        intro: t("form.addRMDomestic_Jali_ScarapRate"),
                    },
                    {
                        element: "#AddRMDomestic_CircleScrapCost",
                        intro: t("form.addRMDomestic_Circle_ScarapRate"),
                    }] : [],
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
                    intro: EffectiveDate,
                },
            ] : [],
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
                    intro: introMessage,
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
            ...config && config.isEditFlag === false ? [
                {
                    element: "#RawMaterialName-add",
                    intro: t("addRawMaterialSpecification.RawMaterialName-add"),
                }
            ] : [],

            {
                element: "#AddSpecification_GradeId_container",
                intro: t("addRawMaterialSpecification.AddSpecification_GradeId_container"),
            },
            ...config && config.isEditFlag === false ? [
                {
                    element: "#GradeId-add",
                    intro: t("addRawMaterialSpecification.GradeIdAdd"),
                }
            ] : [],

            {
                element: "#AddSpecification_Specification",
                intro: t("addRawMaterialSpecification.AddSpecification_Specification"),
            },
            {
                element: "#AddSpecification_Code",
                intro: t("addRawMaterialSpecification.AddSpecification_Code"),
            },

            {
                element: "#rm-specification-cancel",
                intro: t("addRawMaterialSpecification.rm-specification-cancel"),
            },
            {
                element: "#rm-specification-submit",
                intro: introMessage,
            },
        ],
        ADD_RAW_MATERIAL_IMPORT: [
            ...(!(config && config.isEditFlag === true)) ? [
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
                ...config && config?.isEditFlag === false ? [
                    {
                        element: "#addRMImport_RMToggle",
                        intro: t("addRawMaterialImport.addRMImport_RMToggle"),
                    }] : [],

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
                    ...config && config?.isEditFlag === false ? [
                        {
                            element: "#addRMImport_vendorToggle",
                            intro: t("addRawMaterialImport.addRMImport_vendorToggle"),
                        },
                    ] : [],

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
                }] : [],
            ...(config && config?.isRMAssociated === false) || (config && config?.isEditFlag === false) ? [
                {
                    element: "#AddRMImport_EffectiveDate",
                    intro: EffectiveDate,
                },
                {
                    element: "#AddRMImport_cutOffPriceSelectedCurrency",
                    intro: t("addRawMaterialImport.AddRMImport_cutOffPriceSelectedCurrency"),
                },
                {
                    element: "#AddRMImport_BasicRateSelectedCurrency",
                    intro: BasicRate,
                },
                ...config && config?.isEditFlag === true && config?.showCircleJali === false && config?.showScrap === true ? [

                    {
                        element: "#rm-forging-selected-currency",
                        intro: t("addRawMaterialImport.addRMImport_ScarapRate"),
                    }] : [],
                ...config && config?.showCircleJali === true ? [
                    {
                        element: "#AddRMImport_CircleScrapCostSelectedCurrency",
                        intro: t("addRawMaterialImport.addRMImport_Circle_ScarapRate"),

                    },
                    {
                        element: "#jali-scrap-cost-selected-currency",
                        intro: t("addRawMaterialImport.addRMImport_Jali_ScarapRate"),
                    }] : [],
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
                    intro: introMessage,
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
                intro: introMessage,
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
                intro: introMessage,
            },
        ]
    }
}
