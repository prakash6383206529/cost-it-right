import React from 'react';

export function Steps(t) {
    return {
        NAVBAR: [
            {
                element: ".language-dropdown",
                intro: "testing mesage",
            },
            {
                element: ".dashboard",
                intro: t('navbar.dashboard'),
            },
            {
                element: ".masters",
                intro: t('navbar.masters'),
            },
            {
                element: ".costing",
                intro: t("navbar.costing"),
            },
            {
                element: ".rfq",
                intro: t("navbar.rfq"),
            },
        ],
        DASHBOARD_SIMULATION_TAB: [
            {
                element: "#dashboard_simulation_Pending_For_Approval",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Pending_For_Approval"),
            },
            {
                element: "#dashboard_simulation_Awaiting_Approval",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Awaiting_Approval"),
            },
            {
                element: "#dashboard_simulation_Rejected",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Rejected"),
            },
            {
                element: "#dashboard_simulation_Approved",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Approved"),
            },
        ],
        RM_DOMESTIC_FORM: [
            {
                element: "#rm_domestic_form_zero_based",
                intro: t("CommonMessages.form_zero_based"),
            },
            {
                element: "#rm_domestic_form_vendor_based",
                intro: t("CommonMessages.form_vendor_based"),
            },
            {
                element: "#rm_domestic_form_customer_based",
                intro: t("CommonMessages.form_customer_based"),
            },
            {
                element: "#AddRMDomestic_TechnologyId_container",
                intro: t("rmMaster.form.AddRMDomestic_TechnologyId_container"),
            }, 
            {
                element: "#AddRMDomestic_RawMaterialId_container",
                intro: t("rmMaster.form.AddRMDomestic_RawMaterialId_container"),
            }, 
            {
                element: "#addRMDomestic_RMToggle",
                intro: t("rmMaster.form.addRMDomestic_RMToggle"),
            }, 
            {
                element: "#AddRMDomestic_RawMaterialGradeId",
                intro: t("rmMaster.form.AddRMDomestic_RawMaterialGradeId"),
            }, 
            {
                element: "#AddRMDomestic_RawMaterialSpecificationId_container",
                intro: t("rmMaster.form.AddRMDomestic_RawMaterialSpecificationId_container"),
            }, 
            {
                element: "#AddRMDomestic_CategoryId_container",
                intro: t("rmMaster.form.AddRMDomestic_CategoryId_container"),
            }, 
            {
                element: "#AddRMDomestic_SourceSupplierPlantId_container",
                intro: t("rmMaster.form.AddRMDomestic_SourceSupplierPlantId_container"),
            },   
            {
                element: "#AddRMDomestic_Vendor",
                intro: t("rmMaster.form.AddRMDomestic_Vendor"),
            }, 
            {
                element: "#addRMDomestic_vendorToggle",
                intro: t("rmMaster.form.addRMDomestic_vendorToggle"),
            }, 
            {
                element: "#AddRMDomestic_UnitOfMeasurementId_container",
                intro: t("rmMaster.form.AddRMDomestic_UnitOfMeasurementId_container"),
            }, 
            {
                element: "#AddRMDomestic_cutOffPrice",
                intro: t("rmMaster.form.AddRMDomestic_cutOffPrice"),
            }, 
            {
                element: "#AddRMDomestic_BasicRateBaseCurrency",
                intro: t("rmMaster.form.AddRMDomestic_BasicRateBaseCurrency"),
            }, 
            {
                element: "#AddRMDomestic_FreightCharge",
                intro: t("rmMaster.form.AddRMDomestic_FreightCharge"),
            }, 
            {
                element: "#AddRMDomestic_ShearingCost",
                intro: t("rmMaster.form.AddRMDomestic_ShearingCost"),
            },
            {
                element: "#addRMDomestic_conditionToggle",
                intro: t("rmMaster.form.addRMDomestic_conditionToggle"),
            },
            {
                element: "#AddRMDomestic_EffectiveDate",
                intro: t("rmMaster.form.AddRMDomestic_EffectiveDate"),
            }, 
            {
                element: "#AddRMDomestic_Remark",
                intro: t("rmMaster.form.AddRMDomestic_Remark"),
            }, 
            {
                element: "#AddRMDomestic_uploadFiles",
                intro: t("rmMaster.form.AddRMDomestic_uploadFiles"),
            }, 
            {
                element: "#addRMDomestic_cancel",
                intro: t("rmMaster.form.addRMDomestic_cancel"),
            }, 
            {
                element: "#addRMDomestic_sendForApproval",
                intro: t("rmMaster.form.addRMDomestic_sendForApproval"),
            }, 
        ],
        ADD_RAW_MATERIAL_SPEC: [
            {
                element: "#AddSpecification_RawMaterialName_container",
                intro: t("rmMaster.addRawMaterialSpecification.AddSpecification_RawMaterialName_container"),
            }, 
            {
                element: "#AddSpecification_GradeId_container",
                intro: t("rmMaster.addRawMaterialSpecification.AddSpecification_GradeId_container"),
            }, 
            {
                element: "#AddSpecification_Specification",
                intro: t("rmMaster.addRawMaterialSpecification.AddSpecification_Specification"),
            }, 
            {
                element: "#rm-specification-cancel",
                intro: t("rmMaster.addRawMaterialSpecification.rm-specification-cancel"),
            }, 
            {
                element: "#rm-specification-submit",
                intro: t("rmMaster.addRawMaterialSpecification.rm-specification-submit"),
            },
        ],
        ADD_RAW_MATERIAL_IMPORT: [
            {
                element: "#Add_rm_import_zero_based",
                intro: t("rmMaster.addRawMaterialImport.Add_rm_import_zero_based"),
            }, 
            {
                element: "#Add_rm_import_vendor_based",
                intro: t("rmMaster.addRawMaterialImport.Add_rm_import_vendor_based"),
            }, 
            {
                element: "#Add_rm_import_customer_based",
                intro: t("rmMaster.addRawMaterialImport.Add_rm_import_customer_based"),
            }, 
            {
                element: "#AddRMImport_TechnologyId_container",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_TechnologyId_container"),
            }, 
            {
                element: "#addRMImport_RMToggle",
                intro: t("rmMaster.addRawMaterialImport.addRMImport_RMToggle"),
            },  
            {
                element: "#AddRMImport_RawMaterialId_container",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_RawMaterialId_container"),
            }, 
            {
                element: "#AddRMImport_RawMaterialGradeId_container",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_RawMaterialGradeId_container"),
            }, 
            {
                element: "#AddRMImport_RawMaterialSpecificationId_container",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_RawMaterialSpecificationId_container"),
            }, 
            {
                element: "#AddRMImport_CategoryId_container",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_CategoryId_container"),
            }, 
            {
                element: "#AddRMImport_SourceSupplierPlantId_container",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_SourceSupplierPlantId_container"),
            }, 
            {
                element: "#AddRMImport_Vendor",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_Vendor"),
            }, 
            {
                element: "#addRMImport_vendorToggle",
                intro: t("rmMaster.addRawMaterialImport.addRMImport_vendorToggle"),
            }, 
            {
                element: "#AddRMImport_UnitOfMeasurementId_container",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_UnitOfMeasurementId_container"),
            }, 
            {
                element: "#AddRMImport_Currency_container",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_Currency_container"),
            }, 
            {
                element: "#AddRMImport_EffectiveDate",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_EffectiveDate"),
            }, 
            {
                element: "#AddRMImport_cutOffPriceSelectedCurrency",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_cutOffPriceSelectedCurrency"),
            }, 
            {
                element: "#AddRMImport_BasicRateSelectedCurrency",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_BasicRateSelectedCurrency"),
            }, 
            {
                element: "#AddRMImport_FreightChargeSelectedCurrency",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_FreightChargeSelectedCurrency"),
            }, 
            {
                element: "#AddRMImport_ShearingCostSelectedCurrency",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_ShearingCostSelectedCurrency"),
            }, 
            {
                element: "#AddRMImport_Remark",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_Remark"),
            }, 
            {
                element: "#AddRMImport_UploadFiles",
                intro: t("rmMaster.addRawMaterialImport.AddRMImport_UploadFiles"),
            }, 
            {
                element: "#addRMImport_cancel",
                intro: t("rmMaster.addRawMaterialImport.addRMImport_cancel"),
            }, 
            {
                element: "#addRMImport_sendForApproval",
                intro: t("rmMaster.addRawMaterialImport.addRMImport_sendForApproval"),
            },
        ],
        ADD_RM_ASSOCIATION: [
            {
                element: "#Association_RawMaterialName_container",
                intro: t("rmMaster.addRawMaterialAssociation.Association_RawMaterialName_container"),
            }, 
            {
                element: "#Association_GradeId_container",
                intro: t("rmMaster.addRawMaterialAssociation.Association_GradeId_container"),
            }, 
            {
                element: "#Association_MaterialTypeId_container",
                intro: t("rmMaster.addRawMaterialAssociation.Association_MaterialTypeId_container"),
            }, 
            {
                element: "#rmAssociation_cancel",
                intro: t("rmMaster.addRawMaterialAssociation.rmAssociation_cancel"),
            }, 
            {
                element: "#rmAssociation_Save",
                intro: t("rmMaster.addRawMaterialAssociation.rmAssociation_Save"),
            }, 
        ],
        ADD_MATERIAL: [
            {
                element: "#AddMaterialType_MaterialType",
                intro: t("rmMaster.addMaterial.AddMaterialType_MaterialType"),
            },
            {
                element: "#AddMaterialType_CalculatedDensityValue",
                intro: t("rmMaster.addMaterial.AddMaterialType_CalculatedDensityValue"),
            },
            {
                element: "#AddMaterialType_Cancel",
                intro: t("rmMaster.addMaterial.AddMaterialType_Cancel"),
            },
            {
                element: "#AddMaterialType_Save",
                intro: t("rmMaster.addMaterial.AddMaterialType_Save"),
            },
        ],
        ADD_OVERHEADS_DETAILS:[
            {
                element: "#AddOverhead_zerobased",
                intro: t("overheadsdMaster.AddOverhead_zerobased"),
            },
            {
                element: "#AddOverhead_vendorbased",
                intro: t("overheadsdMaster.AddOverhead_vendorbased"),
            },
            {
                element: "#AddOverhead_customerbased",
                intro: t("overheadsdMaster.AddOverhead_customerbased"),
            },
            {
                element: "#AddOverhead_ModelType_container",
                intro: t("overheadsdMaster.AddOverhead_ModelType_container"),
            },
            {
                element: "#AddOverhead_Plant_container",
                intro: t("overheadsdMaster.AddOverhead_Plant_container"),
            },
            {
                element: "#AddOverhead_OverheadApplicability_container",
                intro: t("overheadsdMaster.AddOverhead_OverheadApplicability_container"),
            },
            {
                element: "#AddOverhead_OverheadPercentage",
                intro: t("overheadsdMaster.AddOverhead_OverheadPercentage"),
            },
            {
                element: "#AddOverhead_OverheadRMPercentage",
                intro: t("overheadsdMaster.AddOverhead_OverheadRMPercentage"),
            },        
            {
                element: "#AddOverhead_OverheadMachiningCCPercentage",
                intro: t("overheadsdMaster.AddOverhead_OverheadMachiningCCPercentage"),
            },
            {
                element: "#AddOverhead_OverheadBOPPercentage",
                intro: t("overheadsdMaster.AddOverhead_OverheadBOPPercentage"),
            },
            {
                element: "#AddOverhead_EffectiveDate",
                intro: t("overheadsdMaster.AddOverhead_EffectiveDate"),
            },
            {
                element: "#AddOverhead_Remark",
                intro: t("overheadsdMaster.AddOverhead_Remark"),
            },
            {
                element: "#AddOverhead_UploadFiles",
                intro: t("overheadsdMaster.AddOverhead_UploadFiles"),
            },
            {
                element: "#AddOverhead_Cancel",
                intro: t("overheadsdMaster.AddOverhead_Cancel"),
            },
            {
                element: "#AddOverhead_Save",
                intro: t("overheadsdMaster.AddOverhead_Save"),
            },
        ],
        ADD_PROFIT_DETAILS: [
            {
                element: "#AddProfit_zeroBased",
                intro: t("overheadsProfits.AddProfit_zeroBased"),
            },
            {
                element: "#AddProfit_vendorBased",
                intro: t("overheadsProfits.AddProfit_vendorBased"),
            },
            {
                element: "#AddProfit_customerBased",
                intro: t("overheadsProfits.AddProfit_customerBased"),
            },
            {
                element: "#AddProfit_ModelType_container",
                intro: t("overheadsProfits.AddProfit_ModelType_container"),
            },
            {
                element: "#AddProfit_Plant_container",
                intro: t("overheadsProfits.AddProfit_Plant_container"),
            },
            {
                element: "#AddProfit_ProfitApplicabilityId_container",
                intro: t("overheadsProfits.AddProfit_ProfitApplicabilityId_container"),
            },
            {
                element: "#AddProfit_ProfitPercentage",
                intro: t("overheadsProfits.AddProfit_ProfitPercentage"),
            },
            {
                element: "#AddProfit_ProfitRMPercentage",
                intro: t("overheadsProfits.AddProfit_ProfitRMPercentage"),
            },
            {
                element: "#AddProfit_ProfitMachiningCCPercentage",
                intro: t("overheadsProfits.AddProfit_ProfitMachiningCCPercentage"),
            },
            {
                element: "#AddProfit_ProfitBOPPercentage",
                intro: t("overheadsProfits.AddProfit_ProfitBOPPercentage"),
            },
            {
                element: "#AddProfit_Remark",
                intro: t("overheadsProfits.AddProfit_Remark"),
            },
            {
                element: "#AddProfit_UploadFiles",
                intro: t("overheadsProfits.AddProfit_UploadFiles"),
            },
            {
                element: "#AddProfit_Cancel",
                intro: t("overheadsProfits.AddProfit_Cancel"),
            },
            {
                element: "#AddProfit_Save",
                intro: t("overheadsProfits.AddProfit_Save"),
            },
        ],
        ADD_OPERATION: [
            {
                element: "#Add_operation_zero_based",
                intro: t("operationMaster.Add_operation_zero_based"),
            }, 
            {
                element: "#Add_operation_vendor_based",
                intro: t("operationMaster.Add_operation_vendor_based"),
            }, 
            {
                element: "#Add_operation_customer_based",
                intro: t("operationMaster.Add_operation_customer_based"),
            }, 
            {
                element: "#AddOperation_technology_container",
                intro: t("operationMaster.AddOperation_technology_container"),
            }, 
            {
                element: "#AddOperation_OperationName",
                intro: t("operationMaster.AddOperation_OperationName"),
            }, 
            {
                element: "#AddOperation_Description",
                intro: t("operationMaster.AddOperation_Description"),
            }, 
            {
                element: "#AddOperation_Plant_container",
                intro: t("operationMaster.AddOperation_Plant_container"),
            }, 
            {
                element: "#AddOperation_UnitOfMeasurementId_container",
                intro: t("operationMaster.AddOperation_UnitOfMeasurementId_container"),
            }, 
            {
                element: "#AddOperation_Rate",
                intro: t("operationMaster.AddOperation_Rate"),
            }, 
            {
                element: "#AddOperation_EffectiveDate",
                intro: t("operationMaster.AddOperation_EffectiveDate"),
            }, 
            {
                element: "#AddOperation_Remark",
                intro: t("operationMaster.AddOperation_Remark"),
            }, 
            {
                element: "#AddOperation_UploadFiles",
                intro: t("operationMaster.AddOperation_UploadFiles"),
            }, 
            {
                element: "#AddOperation_Cancel",
                intro: t("operationMaster.AddOperation_Cancel"),
            }, 
            {
                element: "#AddOperation_SendForApproval",
                intro: t("operationMaster.AddOperation_SendForApproval"),
            }, 
        ],
        ADD_FUEL: [
            {
                element: "#AddFuel_zerobased",
                intro: t("addfuel.AddFuel_zerobased"),
            }, 
            {
                element: "#AddFuel_vendorbased",
                intro: t("addfuel.AddFuel_vendorbased"),
            }, 
            {
                element: "#AddFuel_customerbased",
                intro: t("addfuel.AddFuel_customerbased"),
            }, 
            {
                element: "#AddFuel_plant_container",
                intro: t("addfuel.AddFuel_plant_container"),
            }, 
            {
                element: "#AddFuel_Fuel_container ",
                intro: t("addfuel.AddFuel_Fuel_container "),
            }, 
            {
                element: "#AddFuel_CountryId_container",
                intro: t("addfuel.AddFuel_CountryId_container"),
            }, 
            {
                element: "#AddFuel_StateId_container",
                intro: t("addfuel.AddFuel_StateId_container"),
            }, 
            {
                element: "#AddFuel_CityId_container ",
                intro: t("addfuel.AddFuel_CityId_container"),
            }, 
            {
                element: "#AddFuel_Rate",
                intro: t("addfuel.AddFuel_Rate"),
            }, 
            {
                element: "#AddFuel_EffectiveDate",
                intro: t("addfuel.AddFuel_EffectiveDate"),
            }, 
            {
                element: "#AddFuel_Cancel",
                intro: t("addfuel.AddFuel_Cancel"),
            }, 
            {
                element: "#AddFuel_Save",
                intro: t("addfuel.AddFuel_Save"),
            }, 
        ],
        ADD_FUEL_NAME_DRAWERS: [
            {
                element: "#AddFuelNameDrawer_FuelName",
                intro: t("addfuelNameDrawers.AddFuelNameDrawer_FuelName"),
            }, 
            {
                element: "#AddFuelNameDrawer_UnitOfMeasurementId_container",
                intro: t("addfuelNameDrawers.AddFuelNameDrawer_UnitOfMeasurementId_container"),
            }, 
            {
                element: "#AddFuelNameDrawer_Cancel",
                intro: t("addfuelNameDrawers.AddFuelNameDrawer_Cancel"),
            }, 
            {
                element: "#AddFuelNameDrawer_Save",
                intro: t("addfuelNameDrawers.AddFuelNameDrawer_Save"),
            }, 
        ],
        ADD_POWER: [
            {
                element: "#AddPower_zerobased",
                intro: t("addPower.AddPower_zerobased"),
            }, 
            {
                element: "#AddPower_vendorbased",
                intro: t("addPower.AddPower_vendorbased"),
            }, 
            {
                element: "#AddPower_customerbased",
                intro: t("addPower.AddPower_customerbased"),
            }, 
            {
                element: "#AddPower_state_container",
                intro: t("addPower.AddPower_state_container"),
            }, 
            {
                element: "#AddPower_Plant_container",
                intro: t("addPower.AddPower_Plant_container"),
            }, 
            {
                element: "#AddPower_EffectiveDate",
                intro: t("addPower.AddPower_EffectiveDate"),
            }, 
            {
                element: "#AddPower_NetPowerCostPerUnit",
                intro: t("addPower.AddPower_NetPowerCostPerUnit"),
            }, 
            {
                element: "#AddPower_Cancel",
                intro: t("addPower.AddPower_Cancel"),
            }, 
            {
                element: "#AddPower_Save",
                intro: t("addPower.AddPower_Save"),
            }, 

        ],
        ADD_ASSEMBLY_PART: [
            {
                element: "#AddAssemblyPart_BOMNumber",
                intro: t("addAssemblyPart.AddAssemblyPart_BOMNumber"),
            }, 
            {
                element: "#AddAssemblyPart_AssemblyPartNumber",
                intro: t("addAssemblyPart.AddAssemblyPart_AssemblyPartNumber"),
            }, 
            {
                element: "#AddAssemblyPart_AssemblyPartName",
                intro: t("addAssemblyPart.AddAssemblyPart_AssemblyPartName"),
            }, 
            {
                element: "#AddAssemblyPart_Description",
                intro: t("addAssemblyPart.AddAssemblyPart_Description"),
            }, 
            {
                element: "#AddAssemblyPart_ECNNumber",
                intro: t("addAssemblyPart.AddAssemblyPart_ECNNumber"),
            }, 
            {
                element: "#AddAssemblyPart_RevisionNumber",
                intro: t("addAssemblyPart.AddAssemblyPart_RevisionNumber"),
            }, 
            {
                element: "#AddAssemblyPart_DrawingNumber",
                intro: t("addAssemblyPart.AddAssemblyPart_DrawingNumber"),
            }, 
            {
                element: "#AddAssemblyPart_ProductGroup_container",
                intro: t("addAssemblyPart.AddAssemblyPart_ProductGroup_container"),
            }, 
            {
                element: "#AddAssemblyPart_TechnologyId_container",
                intro: t("addAssemblyPart.AddAssemblyPart_TechnologyId_container"),
            }, 
            {
                element: "#AddAssemblyPart_EffectiveDate",
                intro: t("addAssemblyPart.AddAssemblyPart_EffectiveDate"),
            }, 
            {
                element: "#AddAssemblyPart_Remark",
                intro: t("addAssemblyPart.AddAssemblyPart_Remark"),
            }, 
            {
                element: "#AddAssemblyPart_UploadFiles",
                intro: t("addAssemblyPart.AddAssemblyPart_UploadFiles"),
            }, 
            {
                element: "#AddAssemblyPart_Cancel",
                intro: t("addAssemblyPart.AddAssemblyPart_Cancel"),
            }, 
            {
                element: "#AddAssemblyPart_Save",
                intro: t("addAssemblyPart.AddAssemblyPart_Save"),
            }, 
        ],
        ADD_COMPONENT_PART: [
            {
                element: "#AddIndivisualPart_PartNumber",
                intro: t("addComponentPart.AddIndivisualPart_PartNumber"),
            },
            {
                element: "#AddIndivisualPart_PartName",
                intro: t("addComponentPart.AddIndivisualPart_PartName"),
            },
            {
                element: "#AddIndivisualPart_Description",
                intro: t("addComponentPart.AddIndivisualPart_Description"),
            },
            {
                element: "#AddIndivisualPart_ProductGroup_container",
                intro: t("addComponentPart.AddIndivisualPart_ProductGroup_container"),
            },
            {
                element: "#AddIndivisualPart_ECNNumber",
                intro: t("addComponentPart.AddIndivisualPart_ECNNumber"),
            },
            {
                element: "#AddIndivisualPart_RevisionNumber",
                intro: t("addComponentPart.AddIndivisualPart_RevisionNumber"),
            },
            {
                element: "#AddIndivisualPart_DrawingNumber",
                intro: t("addComponentPart.AddIndivisualPart_DrawingNumber"),
            },
            {
                element: "#AddIndivisualPart_TechnologyId_container",
                intro: t("addComponentPart.AddIndivisualPart_TechnologyId_container"),
            }, 
            {
                element: "#AddIndivisualPart_EffectiveDate",
                intro: t("addComponentPart.AddIndivisualPart_EffectiveDate"),
            },
            {
                element: "#AddIndivisualPart_Remark",
                intro: t("addComponentPart.AddIndivisualPart_Remark"),
            }, 
            {
                element: "#AddIndivisualPart_UploadFiles",
                intro: t("addComponentPart.AddIndivisualPart_UploadFiles"),
            },
            {
                element: "#AddIndivisualPart_Cancel",
                intro: t("addComponentPart.AddIndivisualPart_Cancel"),
            }, 
            {
                element: "#AddIndivisualPart_Save",
                intro: t("addComponentPart.AddIndivisualPart_Save"),
            }, 
        ],
        ADD_PRODUCT_PART: [
            {
                element: "#AddIndivisualPart_ProductName",
                intro: t("addProductPart.AddIndivisualPart_ProductName"),
            },
            {
                element: "#AddIndivisualPart_ProductNumber",
                intro: t("addProductPart.AddIndivisualPart_ProductNumber"),
            },
            {
                element: "#AddIndivisualPart_Description",
                intro: t("addProductPart.AddIndivisualPart_Description"),
            },
            {
                element: "#AddIndivisualPart_ProductGroupCode",
                intro: t("addProductPart.AddIndivisualPart_ProductGroupCode"),
            },
            {
                element: "#AddIndivisualPart_ECNNumber",
                intro: t("addProductPart.AddIndivisualPart_ECNNumber"),
            },
            {
                element: "#AddIndivisualPart_RevisionNumber",
                intro: t("addProductPart.AddIndivisualPart_RevisionNumber"),
            },
            {
                element: "#AddIndivisualPart_DrawingNumber",
                intro: t("addProductPart.AddIndivisualPart_DrawingNumber"),
            },
            {
                element: "#AddIndivisualPart_EffectiveDate",
                intro: t("addProductPart.AddIndivisualPart_EffectiveDate"),
            },
            {
                element: "#AddIndivisualPart_Remark",
                intro: t("addProductPart.AddIndivisualPart_Remark"),
            },
            {
                element: "#AddIndivisualPart_UploadFiles",
                intro: t("addProductPart.AddIndivisualPart_UploadFiles"),
            },
            {
                element: "#AddIndivisualPart_Cancel",
                intro: t("addProductPart.AddIndivisualPart_Cancel"),
            },
            {
                element: "#AddIndivisualPart_Save",
                intro: t("addProductPart.AddIndivisualPart_Save"),
            },

        ],
        ADD_MACHINE_RATE: [
            {
                element: "#AddMachineRate_zeroBased",
                intro: t("addMachineRate.AddMachineRate_zeroBased"),
            },
            {
                element: "#AddMachineRate_vendorBased",
                intro: t("addMachineRate.AddMachineRate_vendorBased"),
            },
            {
                element: "#AddMachineRate_customerBased",
                intro: t("addMachineRate.AddMachineRate_customerBased"),
            },
            {
                element: "#AddMachineRate_technology_container",
                intro: t("addMachineRate.AddMachineRate_technology_container"),
            },
            {
                element: "#AddMachineRate_Plant_container",
                intro: t("addMachineRate.AddMachineRate_Plant_container"),
            },
            {
                element: "#AddMachineRate_Specification",
                intro: t("addMachineRate.AddMachineRate_Specification"),
            },
            {
                element: "#AddMachineRate_MachineName",
                intro: t("addMachineRate.AddMachineRate_MachineName"),
            },
            {
                element: "#AddMachineRate_MachineType_container",
                intro: t("addMachineRate.AddMachineRate_MachineType_container"),
            },
            {
                element: "#AddMachineRate_TonnageCapacity",
                intro: t("addMachineRate.AddMachineRate_TonnageCapacity"),
            },
            {
                element: "#AddMachineRate_EffectiveDate",
                intro: t("addMachineRate.AddMachineRate_EffectiveDate"),
            },
            {
                element: "#addMoreMachine_Details",
                intro: t("addMachineRate.addMoreMachine_Details"),
            },
            {
                element: "#AddMachineRate_ProcessName_container",
                intro: t("addMachineRate.AddMachineRate_ProcessName_container"),
            },
            {
                element: "#Add_Machine_Process",
                intro: t("addMachineRate.Add_Machine_Process"),
            },
            {
                element: "#AddMachineRate_UOM_container",
                intro: t("addMachineRate.AddMachineRate_UOM_container"),
            },
            {
                element: "#AddMachineRate_MachineRate",
                intro: t("addMachineRate.AddMachineRate_MachineRate"),
            },
            {
                element: "#AddMachineRate_Remark",
                intro: t("addMachineRate.AddMachineRate_Remark"),
            },


            

        ],
        ADD_MACHINE_MORE_RATE_DETAILS:[
            {
                element: "#AddMoreDetails_Plant_container",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_Plant_container"),
            },
            {
                element: "#AddMoreDetails_MachineName",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_MachineName"),
            },
            {
                element: "#AddMoreDetails_Specification",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_Specification"),
            },
            {
                element: "#AddMoreDetails_Description",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_Description"),
            },
            {
                element: "#AddMoreDetails_MachineType_container",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_MachineType_container"),
            },
            {
                element: "#AddMoreDetails_Manufacture",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_Manufacture"),
            },            
            {
                element: "#AddMoreDetails_yearofManfacturing",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_yearofManfacturing"),
            },
            {
                element: "#AddMoreDetails_TonnageCapacity",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_TonnageCapacity"),
            },
            {
                element: "#AddMoreDetails_MachineCost",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_MachineCost"),
            },
            {
                element: "#AddMoreDetails_AccessoriesCost",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_AccessoriesCost"),
            },
            {
                element: "#AddMoreDetails_InstallationCharges",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_InstallationCharges"),
            },
            {
                element: "#AddMoreDetails_EffectiveDate",
                intro: t("addMachineRateMoreDetails.AddMoreDetails_EffectiveDate"),
            },
        ]
     
    }
}
export const Hints = (t) => {
    return {
        RFQ_LISTING: [
            {
                element: "#view-btn0",
                hint: t("hints.view-btn0"),
            },
        ],
        CREATE_COSTING_RMC: [
            {
                element: ".Close",
                hint: t("hints.Close"),
            },
        ],
        COSTING_SAVE_BUTTON: [
            {
                element: '#rmc-save-btn',
                hint: t("hints.rmc-save-btn"),
                hintPosition: 'left-top',
            }
        ],
        COSTING_SEND_BUTTON_LOGISTICS: [
            {
                element: '#logistics-next-btn',
                hint: t("hints.logistics-next-btn"),
                hintPosition: 'left-top',
            }
        ],
        COSTING_SEND_BUTTON: [
            {
                element: '#next-btn',
                hint: t("hints.next-btn"),
                hintPosition: 'left-top',
            }
        ],
        SURFACE_TREATMENT: [
            {
                element: ".surface-treatment-btn",
                hint: t("hints.surface-treatment-btn"),
                hintPosition: 'left-top'
            }
        ],
        OVERHEAD_PROFIT: [
            {
                element: ".overhead-icon",
                hint: t("hints.overhead-icon"),
                hintPosition: 'left-top'
            }
        ],
    }
}