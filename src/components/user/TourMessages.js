export function Steps(t, config) {
    const userManagementArray = [

        {
            element: "#FirstName_container",
            intro: t("userManagement.AddUser_FirstName"),
        },
        {
            element: "#LastName_container",
            intro: t("userManagement.AddUser_LastName"),
        },
        {
            element: "#Mobile_container",
            intro: t("userManagement.AddUser_Mobile"),
        },
        {
            element: "#PhoneNumber_container",
            intro: t("userManagement.AddUser_PhoneNumber"),
        },
        {
            element: "#Extension_container",
            intro: t("userManagement.AddUser_Extension"),
        },
        {
            element: "#EmailAddress_container",
            intro: t("userManagement.AddUser_Email"),
        },
        {
            element: "#UserName_container",
            intro: t("userManagement.AddUser_UserName"),
        },
        {
            element: "#password",
            intro: t("userManagement.AddUser_Password"),
        },
        {
            element: "#AddUser_PasswordConfirm",
            intro: t("userManagement.AddUser_ConfirmPassword"),
        },
        {
            element: "#AddressLine1_container",
            intro: t("userManagement.AddUser_Address1"),
        },
        {
            element: "#AddressLine2_container",
            intro: t("userManagement.AddUser_Address2"),
        },
        {
            element: "#CityId_container",
            intro: t("userManagement.AddUser_City"),
        },
        {
            element: "#ZipCode_container",
            intro: t("userManagement.AddUser_ZipCode"),
        },
        {
            element: "#RoleId_container",
            intro: t("userManagement.AddUser_Role"),
        },
        {
            element: "#DepartmentId_container",
            intro: t("userManagement.AddUser_Company"),
        },
        {
            element: "#AddUser_Checkbox",
            intro: t("userManagement.AddUser_Checkbox"),
        },
        {
            element: "#AddUser_Permissions_Costing",
            intro: t("userManagement.AddUser_Permissions_Costing"),
        },
        ...(config && config.costingField ? [{
            element: "#TechnologyId_container",
            intro: t("userManagement.AddUser_Technology"),
        },
        {
            element: '#CostingApprovalType_container',
            intro: t("userManagement.AddUser_ApprovalType"),
        },
        {
            element: "#LevelId_container",
            intro: t("userManagement.AddUser_Level"),
        },
        {
            element: "#AddUser_AddCosting",
            intro: t("userManagement.AddUser_AddCosting"),
        }
        ] : []),
        {
            element: "#AddUser_Permissions_Simulation",
            intro: t("userManagement.AddUser_Permissions_Simulation"),
        },
        ...(config && config.simulationField ? [{
            element: "#Head_container",
            intro: t("userManagement.AddUser_Head"),
        },
        {
            element: '#SimulationApprovalType_container',
            intro: t("userManagement.AddUser_ApprovalType"),
        },
        {
            element: "#simualtionLevel_container",
            intro: t("userManagement.AddUser_Level"),
        },
        {
            element: "#AddUser_AddSimulation",
            intro: t("userManagement.AddUser_AddSimulation"),
        }
        ] : []),
        {
            element: "#AddUser_Permissions_Master",
            intro: t("userManagement.AddUser_Permissions_Master"),
        },
        ...(config && config.masterField ? [{
            element: "#Master_container",
            intro: t("userManagement.AddUser_Master"),
        },
        {
            element: '#MasterApprovalType_container',
            intro: t("userManagement.AddUser_ApprovalType"),
        },
        {
            element: "#masterLevel_container",
            intro: t("userManagement.AddUser_Level"),
        },
        {
            element: "#AddUser_AddMaster",
            intro: t("userManagement.AddUser_AddMaster"),
        }
        ] : []),
        {
            element: "#AddUser_Cancel",
            intro: t("userManagement.AddUser_Cancel"),
        },
        {
            element: "#AddUser_Save",
            intro: t("userManagement.AddUser_Save"),
        },
    ];
    const addCompany = [
        {
            element: "#AddCompany_Name",
            intro: t("addCompany.AddCompany_Name"),
        },
        {
            element: "#AddCompany_Code",
            intro: t("addCompany.AddCompany_Code"),
        },
        {
            element: "#AddCompany_Cancel",
            intro: t("addCompany.AddCompany_Cancel"),
        },
        {
            element: "#AddCompany_Save",
            intro: t("addCompany.AddCompany_Save"),
        }
    ];
    const addRole = [
        {
            element: "#AddRole_Name",
            intro: t("addRole.AddRole_Name"),

        },
        {
            element: "#Dashboard",
            intro: t("addRole.dashboard"),
        },
        {
            element: "#Masters",
            intro: t("addRole.masters"),
        },
        {
            element: "#AdditionalMasters",
            intro: t("addRole.additionalMasters"),
        },
        {
            element: "#Costing",
            intro: t("addRole.costing"),
        },
        {
            element: "#Simulation",
            intro: t("addRole.simulation"),
        },
        {
            element: "#Reports",
            intro: t("addRole.reports"),
        },
        {
            element: "#Users",
            intro: t("addRole.users"),
        },
        {
            element: "#RFQ",
            intro: t("addRole.RFQ"),
        },
        {
            element: "#NFR",
            intro: t("addRole.NFR"),

        },
        {
            element: "#Audit",
            intro: t("addRole.audit"),
        },

        {
            element: "#AddRole_Cancel",
            intro: t("addRole.AddRole_Cancel"),
        },
        {
            element: "#AddRole_Save",
            intro: t("addRole.AddRole_Save"),
        }
    ];
    const AddlevelMapping = [
        {
            element: "#AddApproval_CostingLevel",
            intro: t("approvalForm.AddApproval_CostingLevel"),
        },
        {
            element: "#AddApproval_SimulationLevel",
            intro: t("approvalForm.AddApproval_SimulationLevel"),
        },
        {
            element: "#AddApproval_MasterLevel",
            intro: t("approvalForm.AddApproval_MasterLevel"),
        },
        {
            element: "#Level_ApprovalType_container",
            intro: t("approvalForm.AddApproval_ApprovalType_Required"),
        },
        {
            element: "#Level_TechnologyId_container",
            intro: t("approvalForm.AddApproval_TechnologyHeads"),
        },
        {
            element: "#Level_LevelId_container",
            intro: t("approvalForm.AddApproval_HighestApprovalLevel"),
        },
        {
            element: "#AddApproval_Cancel",
            intro: t("approvalForm.AddApproval_Cancel"),
        },
        {
            element: "#AddApproval_Save",
            intro: t("approvalForm.AddApproval_Save"),
        },
    ];


    return {
        USER_MANAGEMENT: userManagementArray,
        ADD_COMPANY: addCompany,
        ADD_ROLE: addRole,
        ADD_LEVEL_MAPPING: AddlevelMapping
    };
}
