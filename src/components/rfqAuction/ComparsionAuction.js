import React, { useState, useEffect, useRef, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  Tooltip,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import {
  AsyncSearchableSelectHookForm,
  SearchableSelectHookForm,
  TextAreaHookForm,
  TextFieldHookForm,
  DatePickerHookForm,
} from "../layout/HookFormInputs";
import {
  getReporterList,
  getVendorNameByVendorSelectList,
  getPlantSelectListByType,
  fetchSpecificationDataAPI,
  getUOMSelectList,
} from "../../actions/Common";
import {
  getCostingSpecificTechnology,
  getExistingCosting,
  getPartInfo,
} from "../costing/actions/Costing";
import {
  IsSendQuotationToPointOfContact,
  addDays,
  checkPermission,
  getConfigurationKey,
  getTimeZone,
  loggedInUserId,
} from "../../helper";
import { checkForNull, checkForDecimalAndNull } from "../../helper/validation";
import {
  BOUGHTOUTPARTSPACING,
  BoughtOutPart,
  COMPONENT_PART,
  DRAFT,
  EMPTY_DATA,
  FILE_URL,
  PREDRAFT,
  PRODUCT_ID,
  RFQ,
  RFQVendor,
  VBC_VENDOR_TYPE,
  ZBC,
  searchCount,
} from "../../config/constants";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import Dropzone from "react-dropzone-uploader";
import "react-dropzone-uploader/dist/styles.css";
import Toaster from "../common/Toaster";
import { MESSAGES } from "../../config/message";
import {
  createRfqQuotation,
  fileUploadQuotation,
  getQuotationById,
  updateRfqQuotation,
  getContactPerson,
  checkExistCosting,
  setRFQBulkUpload,
  getNfrSelectList,
  getNfrAnnualForecastQuantity,
  getNFRRMList,
  getPartNFRRMList,
  checkLPSAndSCN,
  getrRqVendorDetails,
  getTargetPrice,
  setVendorDetails,
  getAssemblyChildpart,
  getRfqRaiseNumber,
  saveRfqPartDetails,
  getRfqPartDetails,
  deleteQuotationPartDetail,
  setRfqPartDetails,
  setQuotationIdForRfq,
} from "./actions/rfq";
import PopupMsgWrapper from "../common/PopupMsgWrapper";
import LoaderCustom from "../common/LoaderCustom";
import redcrossImg from "../../assests/images/red-cross.png";
import NoContentFound from "../common/NoContentFound";
import HeaderTitle from "../common/HeaderTitle";
import { reactLocalStorage } from "reactjs-localstorage";
import {
  autoCompleteDropdown,
  autoCompleteDropdownPart,
} from "../common/CommonFunctions";
import BulkUpload from "../massUpload/BulkUpload";
import _ from "lodash";
import { getPartSelectListWtihRevNo } from "../masters/actions/Volume";
import {
  ASSEMBLY,
  AcceptableRMUOM,
  DATE_STRING,
  DURATION_STRING,
  LOGISTICS,
  REMARKMAXLENGTH,
  visibilityModeDropdownArray,
} from "../../config/masterData";
import DayTime from "../common/DayTimeWrapper";
import DatePicker from "react-datepicker";
import { setHours, setMinutes } from "date-fns";
import WarningMessage from "../common/WarningMessage";
import {
  clearGradeSelectList,
  clearSpecificationSelectList,
  getRMGradeSelectListByRawMaterial,
  getRawMaterialNameChild,
} from "../masters/actions/Material";
import { Steps } from "./TourMessages";
import { useTranslation } from "react-i18next";
import TourWrapper from "../common/Tour/TourWrapper";
import { getSelectListPartType } from "../masters/actions/Part";
import ProcessDrawer from "./ProcessDrawer";
import Button from "../layout/Button";
// import { ApplyPermission } from '..AuctionIndex';

const gridOptionsPart = {};
const gridOptionsVendor = {};

function ComparsionAuction(props) {
  // const permissions = useContext(ApplyPermission);

  // const Vendor = permissions.permissionDataVendor

  // const Part = permissions.permissionDataPart

  const dispatch = useDispatch();
  const { t } = useTranslation("Rfq");
  const { data: dataProps } = props;

  const dropzone = useRef(null);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    control,
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const currentDate = new Date();
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  const [getReporterListDropDown, setGetReporterListDropDown] = useState([]);
  const [vendor, setVendor] = useState([]);
  const [vendorName, setVendorName] = useState("");
  const [isEditAll, setIsEditAll] = useState(false);
  const [isEditSubmissionDate, setIsEditSubmissionDate] = useState(false);
  const [isViewFlag, setIsViewFlag] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [inputLoader, setInputLoader] = useState(false);
  const [VendorInputLoader, setVendorInputLoader] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [partList, setPartList] = useState([]);

  const [vendorList, setVendorList] = useState([]);
  const [updateButtonPartNoTable, setUpdateButtonPartNoTable] = useState(false);
  const [updateButtonVendorTable, setUpdateButtonVendorTable] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showCounterPopup, setShowCounterPopup] = useState(false);
  const [selectedRowVendorTable, setSelectedVendorTable] = useState({});
  const [files, setFiles] = useState([]);
  const [IsOpen, setIsOpen] = useState(false);
  const [apiData, setData] = useState({});
  const [isDisable, setIsDisable] = useState(false);
  const [apiCallCounter, setApiCallCounter] = useState(0);
  const [partNoDisable, setPartNoDisable] = useState(true);
  const [attachmentLoader, setAttachmentLoader] = useState(false);
  const [partName, setPartName] = useState("");
  const [technology, setTechnology] = useState({});

  const [submissionDate, setSubmissionDate] = useState("");
  const [visibilityMode, setVisibilityMode] = useState({});
  const [dateAndTime, setDateAndTime] = useState("");
  const [minHours, setMinHours] = useState(currentHours);
  const [minMinutes, setMinMinutes] = useState(currentMinutes);
  const [isConditionalVisible, setIsConditionalVisible] = useState(false);
  const [isWarningMessageShow, setIsWarningMessageShow] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isBulkUpload, setisBulkUpload] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [viewTooltip, setViewTooltip] = useState(false);
  const [fiveyearList, setFiveyearList] = useState([]);
  const [selectedparts, setSelectedParts] = useState([]);
  const [nfrId, setNfrId] = useState("");
  const [storeNfrId, setStoreNfrId] = useState("");
  const [rmName, setRMName] = useState([]);
  const [rmgrade, setRMGrade] = useState([]);
  const [state, setState] = useState(true);
  const [rmspecification, setRMSpecification] = useState([]);
  const [deleteToggle, setDeleteToggle] = useState(false);
  const [plant, setPlant] = useState({});
  const [isNFRFlow, setIsNFRFlow] = useState(false);
  const [rmAPIList, setRMAPIList] = useState([]);
  const [rmNameSelected, setRmNameSelected] = useState(false);
  const [partTypeList, setPartTypeList] = useState([]);
  const [partType, setPartType] = useState([]);
  const [part, setPart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [partTypeforRM, setPartTypeforRM] = useState([]);
  const [assemblyPartNumber, setAssemblyPartNumber] = useState("");
  const [selectedUOM, setSelectedUOM] = useState("");
  const [requirementDate, setRequirementDate] = useState("");
  // below key is for managing the fields required for havells
  const [isPartVisible, setIsPartVisible] = useState(true);
  const [popupMessage, setPopupMessage] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [plantId, setPlantId] = useState("");
  const [alreadyInDeviation, setAlreadyInDeviation] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [specificationList, setSpecificationList] = useState([]);
  const [remark, setRemark] = useState("");
  const [childPartFiles, setChildPartFiles] = useState([]);
  const [havellsDesignPart, setHavellsDesignPart] = useState([]);
  const [targetPrice, setTargetPrice] = useState("");
  const [quotationIdentity, setQuotationIdentity] = useState("");
  const [partIdentity, setPartIdentity] = useState(0);
  const [isPartDetailUpdate, setIsPartDeailUpdate] = useState(false);
  const technologySelectList = useSelector(
    (state) => state.costing.costingSpecifiTechnology
  );
  const rawMaterialNameSelectList = useSelector(
    (state) => state?.material?.rawMaterialNameSelectList
  );
  const gradeSelectList = useSelector(
    (state) => state?.material?.gradeSelectList
  );
  const rmSpecification = useSelector(
    (state) => state?.comman?.rmSpecification
  );
  const initialConfiguration = useSelector(
    (state) => state.auth.initialConfiguration
  );
  const checkRFQPartBulkUpload = useSelector(
    (state) => state.rfq.checkRFQPartBulkUpload
  );
  const nfrSelectList = useSelector((state) => state.rfq.nfrSelectList);
  const UOMSelectList = useSelector((state) => state.comman.UOMSelectList);
  const showSendButton = dataProps?.rowData?.Status || "";
  const isDropdownDisabled =
    (initialConfiguration.IsCriticalVendorConfigured && isViewFlag) ||
    (!dataProps?.isAddFlag &&
      !(
        showSendButton === "Draft" ||
        showSendButton === "PreDraft" ||
        showSendButton === ""
      ));

  // const getReporterListDropDown = useSelector(state => state.comman.getReporterListDropDown)
  const plantSelectList = useSelector((state) => state.comman.plantSelectList);
  const {
    getRfqVendorDetail,
    getTargetprice,
    getPartIndentity,
    getQuotationIdForRFQ,
  } = useSelector((state) => state.rfq);

  const [viewQuotationPart, setViewQuotationPart] = useState(false);
  const [havellsPartTypeList, setHavellsPartTypeList] = useState([]);
  const [editQuotationPart, setEditQuotationPart] = useState(false);
  const [uniquePartList, setUniquePartList] = useState([]);
  const [havellsKey, setHavellsKey] = useState(true);
  const [storePartsDetail, setStorePartsDetail] = useState([]);
  const [partEffectiveDate, setPartEffectiveDate] = useState("");
  const [sopQuantityList, setSopQuantityList] = useState([]);
  const [disabledPartUid, setDisabledPartUId] = useState(true);
  const [sopdate, setSOPDate] = useState("");

  const [disabledVendoUi, setDisabledVendoUId] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  const isPartEffectiveDateValid =
    partEffectiveDate &&
    new Date(partEffectiveDate).getTime() > new Date().getTime();
  const effectiveMinDate = isPartEffectiveDateValid
    ? new Date(partEffectiveDate)
    : new Date();
  let partIndex = "";
  useEffect(() => {
    if (dataProps?.isAddFlag) {
      dispatch(setQuotationIdForRfq(""));
      setTimeout(() => {
        const obj = createQuotationObject(null);
        dispatch(
          createRfqQuotation(obj, (res) => {
            setQuotationIdentity(res?.data?.Identity);
          })
        );
      }, 200);
    }
  }, []);

  // useEffect(() => {
  //     if (showSendButton === DRAFT) {
  //         setDisabledVendoUId((Vendor && (Vendor?.Add || Vendor?.Edit)) ? false : true)
  //     } else if (dataProps?.isAddFlag || showSendButton === PREDRAFT) {

  //         setDisabledPartUId((Part && (Part?.Add || Part?.Edit)) ? false : true)
  //     }
  // }, [showSendButton, Vendor, Part])

  useEffect(() => {
    if (getTargetprice && getTargetprice?.TargetPrice) {
      setValue("TargetPrice", getTargetprice?.TargetPrice);
    }
  }, [getTargetprice]);
  useEffect(() => {
    const partTypeString = initialConfiguration?.HavellsPartTypeList;
    if (partTypeString) {
      const formattedPartTypeList = partTypeString.split(",").map((part) => {
        const [label, value] = part.split("=");
        return { label: label.trim(), value: value.trim() };
      });
      setHavellsPartTypeList(formattedPartTypeList);
    }
  }, [initialConfiguration]);
  useEffect(() => {
    const { vbcVendorGrid } = props;
    dispatch(getUOMSelectList(() => {}));
    dispatch(getPlantSelectListByType(ZBC, "RFQ", nfrId, () => {}));
    //MINDA
    // dispatch(getPlantSelectListByType(ZBC, nfrId, () => { }))
    dispatch(
      getSelectListPartType((res) => {
        setPartTypeList(res?.data?.SelectList);
      })
    );

    dispatch(getRawMaterialNameChild(() => {}));
    if (initialConfiguration.IsNFRConfigured) {
      dispatch(getNfrSelectList(() => {}));
    }
    let tempArr = [];
    vbcVendorGrid &&
      vbcVendorGrid.map((el) => {
        tempArr.push(el.VendorId);
        return null;
      });
    initialConfiguration?.IsDestinationPlantConfigure === false &&
      setSelectedVendors(tempArr);
    return () => {
      reactLocalStorage?.setObject("Data", []);
      reactLocalStorage.setObject("PartData", []);
      setUpdateButtonVendorTable(false);
      dispatch(setRFQBulkUpload([]));
    };
  }, []);

  useEffect(() => {
    const filteredArray = selectedparts.filter((obj) => {
      return obj.value !== deleteToggle?.rowData?.PartId;
    });
    setSelectedParts(filteredArray);
  }, [deleteToggle]);

  useEffect(() => {
    let tempp = _.unionBy(
      partList,
      checkRFQPartBulkUpload?.SuccessfulRecord,
      "PartNumber"
    );
    setPartList(tempp);
  }, [checkRFQPartBulkUpload]);

  const convertToPartList = (partListTemp, isnfr) => {
    let tempArr = [];
    if (isnfr) {
      let listFinal = [];
      let apiListForRM = [];

      let listWithRMData = [];
      partListTemp &&
        partListTemp?.map((item, index) => {
          let listWithSOPData = [];

          item.SOPQuantity.map((ele, ind) => {
            let obj = {};
            obj.PartNo = item.PartNumber;
            obj.PartId = item?.PartId;
            obj.Quantity = ele?.Quantity;
            obj.YearName = ele?.YearName;
            if (ind === 2) {
              obj.PartNumber = item.PartNumber;
              obj.VendorListExisting = item.VendorList;
              obj.TargetPrice = item.TargetPrice;
              obj.UOM = item.UOMSymbol;
              obj.RequirementDate = item.TimeLine;
            }
            listWithSOPData.push(obj);
            return null;
          });

          listFinal = [...listWithSOPData];
          // item?.RMDetailsResponses && item?.RMDetailsResponses?.map((itemRM, indexRM) => {
          //     let objFinal = listWithSOPData[indexRM] ?? {}
          //     objFinal.RMName = itemRM?.RawMaterialName
          //     objFinal.RawMaterialChildId = itemRM?.RawMaterialChildId
          //     objFinal.RMGrade = itemRM?.RawMaterialGrade
          //     objFinal.RawMaterialGradeId = itemRM?.RawMaterialGradeId
          //     objFinal.RMSpecification = itemRM?.RawMaterialSpecification
          //     objFinal.RawMaterialSpecificationId = itemRM?.RawMaterialSpecificationId
          //     objFinal.IsRMAdded = itemRM?.RawMaterialSpecificationId
          //     if (indexRM > listWithSOPData?.length - 1) {
          //         listWithSOPData.push(objFinal)
          //     } else {
          //         Object.assign([...listWithSOPData], { indexRM: objFinal })
          //     }
          // })
          let obj = {
            partName: {
              label: item.PartNumber,
              value: item.PartId,
              RevisionNumber: item.RevisionNumber,
            },
            RmList: listFinal,
          };
          apiListForRM.push(obj);
          listWithRMData.push(listWithSOPData);
          return null;
        });
      let listtt = [];
      listWithRMData &&
        listWithRMData?.map((item) => {
          listtt = [...listtt, ...item];
        });
      tempArr = listtt;
      let rmListTemp = listtt && listtt?.filter((item) => item.IsRMAdded);
      let ListTemp = [];
      rmListTemp &&
        rmListTemp?.map((item) => {
          let obj = {
            partName: {
              label: item?.PartNo,
              value: item?.PartId,
              RevisionNumber: null,
            },
            // "RmList": [
            //     {
            //         "RawMaterialChildId": item?.RawMaterialChildId,
            //         "RawMaterialName": item?.RMName,
            //         "RawMaterialGradeId": item?.RawMaterialGradeId,
            //         "RawMaterialGrade": item?.RMGrade,
            //         "RawMaterialSpecificationId": item?.RawMaterialSpecificationId,
            //         "RawMaterialSpecification": item?.RMSpecification,
            //     }
            // ]
          };
          ListTemp.push(obj);
        });
      setRMAPIList(ListTemp);
    } else {
      partListTemp &&
        partListTemp?.map((item) => {
          // item.SOPQuantity.map((ele, ind) => {
          //     if (ind !== 2) {
          //         ele.PartNo = ele.PartNumber
          //         ele.PartId = item?.PartId
          //         delete ele.PartNumber
          //     } else {
          //         ele.PartNo = ele?.PartNumber
          //         ele.PartId = item?.PartId
          //         ele.TargetPrice = item?.TargetPrice
          //         ele.UOM = item?.UOMSymbol
          //         ele.TimeLine = item?.TimeLine
          //         ele.PartType = item?.PartType
          //         ele.HavellsDesignPart = item?.HavellsDesignPart
          //         ele.QuotationPartId = item?.QuotationPartId
          //         ele.HavellsDesignPartId = item?.HavellsDesignPartId
          //         ele.UOMId = item?.UOMId
          //         ele.PartTypeId = item?.PartTypeId

          //     }
          //     return null
          // })

          tempArr.push(item);

          return null;
        });
    }

    return tempArr;
  };

  useEffect(() => {
    dispatch(getCostingSpecificTechnology(loggedInUserId(), () => {}));
    dispatch(getReporterList(() => {}));

    var newDate = addDays(new Date(), 7);
    setSubmissionDate(newDate);

    if (dataProps?.isEditFlag || dataProps?.isViewFlag) {
      setLoader(true);
      dispatch(
        getQuotationById(dataProps?.Id, (res) => {
          setPartNoDisable(false);

          if (res?.data?.Data) {
            let data = res?.data?.Data;
            setIsEditAll(data?.IsSent ? false : true);
            setIsEditSubmissionDate(
              data?.IsLastSubmissionEditable ? true : false
            );
            setIsViewFlag(dataProps?.isViewFlag);
            setValue("technology", {
              label: data.TechnologyName,
              value: data.TechnologyId,
            });
            setValue("plant", {
              label: data.PlantName,
              value: data.PlantId,
            });
            dispatch(setQuotationIdForRfq(data?.QuotationId));
            setTechnology({
              label: data.TechnologyName,
              value: data.TechnologyId,
            });
            // setInitialFiles(data?.Attachments)
            // setValue('SubmissionDate', data?.LastSubmissionDate)
            setSubmissionDate(data?.LastSubmissionDate);
            setIsConditionalVisible(data?.IsConditionallyVisible);
            setValue("VisibilityMode", {
              value: data?.VisibilityMode,
              label: data?.VisibilityMode,
            });
            setVisibilityMode({
              value: data?.VisibilityMode,
              label: data?.VisibilityMode,
            });
            setDateAndTime(data?.VisibilityDate);
            setValue("Time", data?.VisibilityDuration);
            setFiles(data?.Attachments);
            setPartList(
              convertToPartList(data.PartList, data?.NfrId ? true : false)
            );
            setVendorList(data.VendorList);
            setValue("remark", data.Remark);
            setValue("nfrId", { label: data?.NfrNumber, value: data?.NfrId });
            setNfrId({ label: data?.NfrNumber, value: data?.NfrId });
            setData(data);
            setIsNFRFlow(data?.NfrId ? true : false);
          }
          setTimeout(() => {
            setLoader(false);
          }, 100);
        })
      );
    }
  }, []);

  const deleteFile = (FileId, OriginalFileName) => {
    if (dataProps?.isAddFlag ? false : dataProps?.isViewFlag || !isEditAll) {
      return false;
    }
    if (FileId != null) {
      let tempArr = files.filter((item) => item.FileId !== FileId);
      setFiles(tempArr);
      setIsOpen(!IsOpen);
    }
    if (FileId == null) {
      let tempArr =
        files && files.filter((item) => item.FileName !== OriginalFileName);
      setFiles(tempArr);
      setIsOpen(!IsOpen);
    }
    // ********** DELETE FILES THE DROPZONE'S PERSONAL DATA STORE **********
    if (dropzone?.current !== null) {
      dropzone.current.files.pop();
    }
  };
  const hyphenFormatter = (props) => {
    const cellValue = props?.value;
    return cellValue !== " " &&
      cellValue !== null &&
      cellValue !== "" &&
      cellValue !== undefined
      ? cellValue
      : "-";
  };
  const Preview = ({ meta }) => {
    return (
      <span
        style={{
          alignSelf: "flex-start",
          margin: "10px 3%",
          fontFamily: "Helvetica",
        }}
      >
        {/* {Math.round(percent)}% */}
      </span>
    );
  };

  const setDisableFalseFunction = () => {
    const loop = Number(dropzone.current.files?.length) - Number(files?.length);
    if (
      Number(loop) === 1 ||
      Number(dropzone.current.files?.length) === Number(files?.length)
    ) {
      setIsDisable(false);
    }
  };

  const handleChangeStatus = ({ meta, file }, status) => {
    if (status === "removed") {
      const removedFileName = file.name;
      let tempArr =
        files &&
        files.filter((item) => item.OriginalFileName !== removedFileName);
      setFiles(tempArr);
      setIsOpen(!IsOpen);
    }

    if (status === "done") {
      let data = new FormData();
      data.append("file", file);
      setApiCallCounter((prevCounter) => prevCounter + 1); // Increment the API call counter for loader showing
      setAttachmentLoader(true);
      setIsDisable(true);
      dispatch(
        fileUploadQuotation(data, (res) => {
          setDisableFalseFunction();
          if ("response" in res) {
            status = res && res?.response?.status;
            dropzone.current.files.pop();
            setAttachmentLoader(false);
          } else {
            let Data = res.data[0];
            setFiles((prevFiles) => [...prevFiles, Data]); // Update the state using the callback function
          }
          setApiCallCounter((prevCounter) => prevCounter - 1);

          // Check if this is the last API call
          if (apiCallCounter === 0) {
            setAttachmentLoader(false);
            setIsDisable(false);
            setTimeout(() => {
              setIsOpen(!IsOpen);
            }, 500);
          }
        })
      );
    }

    if (status === "rejected_file_type") {
      Toaster.warning("Allowed only xls, doc, jpeg, pdf files.");
    } else if (status === "error_file_size") {
      setDisableFalseFunction();
      setAttachmentLoader(false);
      dropzone.current.files.pop();
      Toaster.warning("File size greater than 20 mb not allowed");
    } else if (
      status === "error_validation" ||
      status === "error_upload_params" ||
      status === "exception_upload" ||
      status === "aborted" ||
      status === "error_upload"
    ) {
      // setDisableFalseFunction()
      setAttachmentLoader(false);
      dropzone.current.files.pop();
      Toaster.warning("Something went wrong");
    }
  };

  const closePopUp = () => {
    setValue("vendor", "");
    setShowPopup(false);
    setShowCounterPopup(false);
  };

  const onPopupConfirm = () => {};

  const deleteItemPartTable = (rowData, final) => {
    dispatch(
      deleteQuotationPartDetail(rowData?.QuotationPartId, (res) => {
        Toaster.success("Part has been deleted successfully");
      })
    );
    let arr = final && final.filter((item) => item.PartId !== rowData?.PartId);

    setPartList(arr);
    setDeleteToggle({ deleteToggle: !deleteToggle, rowData: rowData });

    onResetPartNoTable();
  };
  const editItemPartTable = (rowData, final, viewMode) => {
    partIndex = final?.rowIndex;

    setUpdateButtonPartNoTable(true);
    setTimeout(() => {
      setValue("partNumber", {
        label: rowData?.PartNumber,
        value: rowData?.PartId,
      });
      setValue("PartType", {
        label: rowData?.PartType,
        value: rowData?.PartTypeId,
      });
      setValue("HavellsDesignPart", {
        label: rowData?.HavellsDesignPart,
        value: rowData?.HavellsDesignPartId,
      });
      setValue("UOM", { label: rowData?.UOM, value: rowData?.UOMId });
      setValue("Description", rowData?.Description);
      setPartType({ label: rowData?.PartType, value: rowData?.PartTypeId });
      setPartName({ label: rowData?.PartNumber, value: rowData?.PartId });
      setRequirementDate(rowData?.TimeLine || "");
      setAssemblyPartNumber({
        label: rowData?.PartNumber,
        value: rowData?.PartId,
      });
    }, 200);

    // setValue('uom', { label: rowData[0]?.Uom, value: rowData[0]?.UomId })
    dispatch(
      getRfqPartDetails(rowData?.QuotationPartId, (res) => {
        const PartList = res?.data?.Data?.PartList;
        setStorePartsDetail(PartList);
      })
    );
    setEditQuotationPart(viewMode);
    //setDrawerOpen(true)
  };
  const ViewItemPartTable = (rowData, final, viewMode) => {
    setViewQuotationPart(true);
    dispatch(getRfqPartDetails(rowData?.QuotationPartId, (res) => {}));
    setDrawerOpen(true);
  };

  const deleteItemVendorTable = (gridData, props) => {
    let arr = [];
    gridData &&
      gridData.map((item) => {
        if (item?.VendorId !== props?.node?.data?.VendorId) {
          arr.push(item);
        }
        return null;
      });
    setVendorList(arr);
    onResetVendorTable();
  };

  const editItemVendorTable = (gridData, props) => {
    setSelectedVendorTable(props.node.data);

    setUpdateButtonVendorTable(true);
    setValue("vendor", {
      label: props?.node?.data?.Vendor,
      value: props?.node?.data?.VendorId,
    });
    setValue("contactPerson", {
      label: props?.node?.data?.ContactPerson,
      value: props?.node?.data?.ContactPersonId,
    });
    setValue("LDClause", props?.node?.data?.LDClause);
  };
  function createQuotationObject(isSent, quotationId, IsPartDetailsSent) {
    return {
      QuotationId: getQuotationIdForRFQ ? getQuotationIdForRFQ : null,
      QuotationNumber: apiData.QuotationNumber ? apiData.QuotationNumber : null,
      Remark: getValues("remark") || null,
      TechnologyId: getValues("technology")?.value || null,
      PlantId: getValues("plant")?.value || null,
      LoggedInUserId: loggedInUserId(),
      StatusId: null,
      IsSent: isSent,
      IsConditionallyVisible: isConditionalVisible,
      VisibilityMode: visibilityMode?.label || null,
      VisibilityDate: dateAndTime || null,
      VisibilityDuration: getValues("Time") || null,
      LastSubmissionDate: submissionDate
        ? DayTime(submissionDate).format("YYYY-MM-DD HH:mm:ss")
        : null,
      VendorList: vendorList && vendorList.length > 0 ? vendorList : null,
      Timezone: getTimeZone() || null,
      Attachments: files && files.length > 0 ? files : [],
      NfrId: nfrId?.value || null,
      PartList: [],
      // QuotationPartIdList: uniquePartList,
      PartDataSentOn: null,
      IsPartDetailsSent: IsPartDetailsSent,
    };
  }

  /**
   * @method renderListing
   * @description RENDER LISTING IN DROPDOWN
   */
  const renderListing = (label) => {
    const temp = [];
    if (label === "UOM") {
      UOMSelectList &&
        UOMSelectList?.map((item) => {
          const accept = AcceptableRMUOM.includes(item.Type);
          if (accept === false) return false;
          if (item.Value === "0") return false;
          temp.push({ label: item.Display, value: item.Value });
          return null;
        });
      return temp;
    }
    if (label === "plant") {
      plantSelectList &&
        plantSelectList.map((item) => {
          if (item.PlantId === "0") return false;
          temp.push({ label: item.PlantNameCode, value: item.PlantId });
          return null;
        });
      return temp;
    }

    if (label === "technology") {
      technologySelectList &&
        technologySelectList.map((item) => {
          if (item.Value === "0") return false;
          temp.push({ label: item.Text, value: item.Value });
          return null;
        });
      return temp;
    }
    if (label === "nfrId") {
      nfrSelectList &&
        nfrSelectList.map((item) => {
          if (item.Value === "0") return false;
          temp.push({ label: item.Text, value: item.Value });
          return null;
        });
      return temp;
    }

    if (label === "reporter") {
      getReporterListDropDown &&
        getReporterListDropDown.map((item) => {
          if (item.Value === "0") return false;
          temp.push({ label: item.Text, value: item.Value });
          return null;
        });
      return temp;
    }
    if (label === "PartType") {
      partTypeList &&
        partTypeList.map((item) => {
          if (item.Value === "0") return false;
          if (item.Value === PRODUCT_ID) return false;
          if (
            !getConfigurationKey()?.IsBoughtOutPartCostingConfigured &&
            item.Text === BOUGHTOUTPARTSPACING
          )
            return false;
          if (
            String(technology?.value) === String(ASSEMBLY) &&
            (item.Text === COMPONENT_PART || item.Text === BOUGHTOUTPARTSPACING)
          )
            return false;
          temp.push({ label: item.Text, value: item.Value });
          return null;
        });
      return temp;
    }
  };

  const handleSubmitClick = (data, e, isPartDetailSent) => {
    //handleSubmit(() => onSubmit(data, e, isSent))()
    onSubmit(data, e, isPartDetailSent);
  };

  /**
   * @method cancel
   * @description used to Reset form
   */
  const cancel = (isSaveAPICalled = false) => {
    props?.closeDrawer(isSaveAPICalled);
  };

  const onSubmit = (data, e, isPartDetailsSent) => {
    //dispatch(getTargetPrice(plant, technology, assemblyPartNumber, (res) => { }))
    // dispatch(getRfqPartDetails( (res) => {
    //const quotationPartIds = res?.data?.Data.map(item => item.QuotationPartId);
    //  }))

    let tempArr = [...partList];
    let list = [];
    list =
      tempArr &&
      tempArr?.map((item) => {
        if (isNaN(Number(item?.Quantity))) {
          item.Quantity = 0;
        }
        return item;
      });
    // if (Vendor?.add || Vendor?.edit || !havellsKey && vendorList.length === 0) {
    //     Toaster.warning("Please enter vendor details")
    //     return false
    // } else if (Part?.add || Part?.edit || !havellsKey && partList.length === 0) {
    //     Toaster.warning("Please enter part details")
    //     return false
    // } else
    if (!havellsKey && files?.length === 0) {
      Toaster.warning("Please add atleast one attachment file");
      return false;
    } else if (!submissionDate) {
      setIsWarningMessageShow(true);
      return false;
    } else if (Object.keys(errors).length > 0) {
      return false;
    }
    let IsPartDetailsSent;
    let isSent;
    const isShowRfqPartDetail =
      initialConfiguration?.IsShowRFQPartDetailBreakup;
    const hasParts = partList && partList.length > 0;
    const hasVendors = vendorList && vendorList.length > 0;
    if (!isShowRfqPartDetail) {
      IsPartDetailsSent = isPartDetailsSent;
      isSent = isPartDetailsSent;
    } else {
      IsPartDetailsSent = isPartDetailsSent ? hasParts : hasParts && hasVendors;
      isSent = hasParts && hasVendors && isPartDetailsSent;
    }
    // const IsPartDetailsSent = isShowRfqPartDetail ? ((isPartDetailSent && partList && partList.length > 0) ? true : (partList && partList.length > 0 && vendorList && vendorList.length > 0) ? true : false) : false
    // const isSent = isShowRfqPartDetail ? ((partList && vendorList && partList.length > 0 && vendorList.length > 0) ? IsPartDetailsSent : false) : false

    //const isSent = partList && vendorList && partList.length > 0 && vendorList.length > 0 ? true : false

    const obj = createQuotationObject(
      isSent,
      quotationIdentity,
      IsPartDetailsSent
    );

    dispatch(
      createRfqQuotation(obj, (res) => {
        setQuotationIdentity(res?.data?.Identity);
        if (res?.data?.Result) {
          dispatch(setQuotationIdForRfq(""));
          if (
            !showSendButton === "" &&
            (!(showSendButton === DRAFT) || !(showSendButton === PREDRAFT))
          ) {
            Toaster.success(MESSAGES.RFQ_UPDATE_SUCCESS);
          } else if (isSent) {
            Toaster.success(MESSAGES.RFQ_SENT_SUCCESS);
          } else {
            Toaster.success(MESSAGES.RFQ_ADD_SUCCESS);
          }
          cancel();
        }
      })
    );

    dispatch(setVendorDetails({}));
  };

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
  };

  const handleCounterPopup = () => {
    setShowCounterPopup(true);
    console.log("showCounterPopup", showCounterPopup);
  };

  const onGridReady = (params) => {
    params.api.sizeColumnsToFit();
    setGridColumnApi(params.columnApi);
    setGridApi(params.api);
    params.api.paginationGoToPage(0);
    setTimeout(() => {
      setShowTooltip(true);
    }, 100);
  };

  const sopFormatter = (props) => {
    const cellValue = props?.value;
    return cellValue ? cellValue : "-";
  };

  const buttonFormatterFirst = (props) => {
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

    let final = _.map(props?.node?.rowModel?.rowsToDisplay, "data");
    let show = rowData?.PartNumber === undefined ? false : true;
    const row = props?.data;

    return (
      <>
        {show && (
          <button
            title="Edit"
            className="Edit mr-2 align-middle"
            disabled={
              showSendButton === DRAFT
                ? true
                : dataProps?.isAddFlag
                ? false
                : dataProps?.isViewFlag || !isEditAll
            }
            type={"button"}
            onClick={() => editItemPartTable(rowData, props, true)}
          />
        )}
        {show && (
          <button
            title="View"
            className="View mr-2 align-middle"
            disabled={false}
            type={"button"}
            onClick={() => ViewItemPartTable(rowData, props, false)}
          />
        )}

        {/*  {<button title='Delete' className="Delete align-middle" disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !dataProps?.isEditFlag)} type={'button'} onClick={() => deleteItemPartTable(final, props)} />} */}
        {show && (
          <button
            title="Delete"
            className="Delete align-middle"
            disabled={
              showSendButton === DRAFT
                ? true
                : dataProps?.isAddFlag
                ? false
                : dataProps?.isViewFlag || !isEditAll
            }
            type={"button"}
            onClick={() => deleteItemPartTable(row, final)}
          />
        )}
      </>
    );
  };

  const buttonFormatterVendorTable = (props) => {
    return (
      <>
        {
          <button
            title="Edit"
            className="Edit mr-2 align-middle"
            type={"button"}
            disabled={
              dataProps?.isAddFlag ? false : dataProps?.isViewFlag || !isEditAll
            }
            onClick={() =>
              editItemVendorTable(
                props?.agGridReact?.gridOptions.rowData,
                props
              )
            }
          />
        }
        {
          <button
            title="Delete"
            className="Delete align-middle"
            type={"button"}
            disabled={
              dataProps?.isAddFlag ? false : dataProps?.isViewFlag || !isEditAll
            }
            onClick={() =>
              deleteItemVendorTable(
                props?.agGridReact?.gridOptions.rowData,
                props
              )
            }
          />
        }
      </>
    );
  };
  const addRowVendorTable = () => {
    let isDuplicateEntry = false;
    let data = {};
    let temp = [];
    partList &&
      partList.map((item) => {
        temp.push(item.PartId);
        return null;
      });
    data.PartIdList = _.uniq(temp);
    data.PlantId = getValues("plant")?.value;
    data.VendorId = getValues("vendor")?.value;
    dispatch(
      checkLPSAndSCN(data, (res, err) => {
        if (err) {
          Toaster.error("An error occurred while checking LPS and SCN.");

          return;
        }
        let Data = res?.data?.Data;
        if (
          res?.data?.Result &&
          Data &&
          (Data?.LPSRatingIsBlocked || Data?.ClassificationIsBlocked)
        ) {
          const additionalMessage =
            ' Do you want to initiate an unblocking deviation for this vendor at the specified plant? If yes, please click "OK"';

          if (
            Data?.ClassificationDeviationIsInApprovalProcess ||
            Data?.LPSRatingDeviationIsInApprovalProcess
          ) {
            // setShowPopup(true)
            setBlocked(true);
            Toaster.warning(res?.data?.Message);
            setAlreadyInDeviation(true);
            setValue("vendor", "");
            setShowPopup(false);
            return false;
          } else {
            setPopupMessage(res?.data?.Message + additionalMessage);
            setShowPopup(true);
            setVendorId(getValues("vendor"));
            setPlantId(getValues("plant"));
            setBlocked(true);
            return false;
          }
        }
        dispatch(
          checkExistCosting(data, (res) => {
            if (res?.data?.DynamicData?.IsExist) {
              Toaster.warning("Costing already exists for this vendor.");
              return false;
            } else {
              let obj = {};
              obj.VendorId = getValues("vendor")?.value;
              obj.ContactPersonId = getValues("contactPerson")?.value;
              obj.Vendor = getValues("vendor")?.label;
              obj.ContactPerson = getValues("contactPerson")?.label;
              obj.IncoTermsIdRef = getRfqVendorDetail?.IncoTermIdRef;
              obj.IncoTerms = getRfqVendorDetail?.IncoTerms;
              obj.PaymentTermsIdRef = getRfqVendorDetail?.PaymentTermIdRef;
              obj.PaymentTerms = getRfqVendorDetail?.PaymentTerms;
              obj.WarrantyTerms = getValues("WarrantyTerms")?.label;
              obj.LDClause = getValues("LDClause");
              if (obj.VendorId === null || obj.VendorId === undefined) {
                Toaster.warning("Please fill all the mandatory fields first.");
                return false;
              }

              // Check IsSendQuotationToPointOfContact() result and ContactPersonId
              if (
                IsSendQuotationToPointOfContact() &&
                (obj.ContactPersonId === null ||
                  obj.ContactPersonId === undefined)
              ) {
                Toaster.warning("Please fill all the mandatory fields first.");
                return false;
              }

              if (!updateButtonVendorTable) {
                vendorList &&
                  vendorList.map((item) => {
                    if (item.VendorId === obj.VendorId) {
                      isDuplicateEntry = true;
                    }
                    return null;
                  });
              }

              if (isDuplicateEntry) {
                Toaster.warning("This vendor is already added.");
                return false;
              }

              let arr = [...vendorList, obj];

              if (updateButtonVendorTable) {
                //EDIT CASE
                arr = [];
                vendorList &&
                  vendorList.map((item) => {
                    if (
                      JSON.stringify(selectedRowVendorTable) ===
                      JSON.stringify(item)
                    ) {
                      return false;
                    } else {
                      arr.push(item);
                    }
                    return null;
                  });

                arr.map((item) => {
                  if (item.VendorId === obj.VendorId) {
                    isDuplicateEntry = true;
                  }
                  return null;
                });

                if (isDuplicateEntry) {
                  Toaster.warning("This vendor is already added.");
                  return false;
                }

                arr.push(obj);
              }

              setVendorList(arr);
              setValue("vendor", "");
              setValue("contactPerson", "");
              setValue("LDClause", "");
              setValue("WarrantyTerms", "");
              setValue("PaymentTerms", "");
              setValue("IncoTerms", "");
              setUpdateButtonVendorTable(false);
              setGetReporterListDropDown([]);
              dispatch(setVendorDetails({}));
            }
          })
        );
      })
    );
  };
  const addRowPartNoTable = () => {
    if (isNFRFlow) {
      dispatch(
        getPartNFRRMList(nfrId.value, getValues("partNumber")?.value, (res) => {
          let list = [...rmAPIList];
          let obj = {
            partName: getValues("partNumber"),
            RmList: res.data.DataList,
          };
          list.push(obj);

          setRMAPIList(list);

          let objTemp = {};
          let arrTemp = [];
          let Data = {};
          if (nfrId && nfrId.value !== null) {
            dispatch(
              getNfrAnnualForecastQuantity(
                nfrId.value,
                getValues("partNumber")?.value,
                (sopdate = ""),
                (res) => {
                  //CHECK_NFR
                  Data = res.data.Data;
                }
              )
            );
          }
          let dataObj = {
            PartIdList: [getValues("partNumber")?.value],
            PlantId: getValues("plant")?.value,
            VendorId: null,
          };

          let vendorList = [];
          let vendorListFinal = [];

          dispatch(
            checkExistCosting(dataObj, (res) => {
              if (res?.data?.Result) {
                vendorList = [...res?.data?.DataList];
                vendorList &&
                  vendorList?.map((item) => {
                    vendorListFinal.push(
                      `${item?.VendorName} (${item?.VendorCode})`
                    );
                  });
              }

              let tempArrayparts = [...selectedparts, getValues("partNumber")];
              setSelectedParts(tempArrayparts);

              let partNumber = getValues("partNumber");

              let arrTemp = [];

              let newObjTemp = {}; // Initialize the new object

              newObjTemp.PartNo = partNumber?.label;
              newObjTemp.PartId = getValues("partNumber")?.value;
              newObjTemp.UOM = getValues("UOM")?.label;
              newObjTemp.UOMId = getValues("UOM")?.value;
              newObjTemp.TargetPrice = getTargetprice?.TargetPrice || 0;
              newObjTemp.TimeLine = requirementDate.split(" ")[0] || "";
              newObjTemp.PartType = getValues("PartType")?.label;
              newObjTemp.PartTypeId = getValues("PartType")?.value;
              newObjTemp.HavellsDesignPart =
                getValues("HavellsDesignPart")?.label;
              newObjTemp.HavellsDesignPartId =
                getValues("HavellsDesignPart")?.value;
              newObjTemp.Description = getValues("Description");

              arrTemp.push(newObjTemp); // Push the new object to the array

              let dataList = [...arrTemp];
              list[list.length - 1].RmList &&
                list[list.length - 1].RmList?.map((item, index) => {
                  let obj = arrTemp[index] ?? {};
                  obj.RMGrade = item.RawMaterialGrade;
                  obj.RawMaterialGradeId = item.RawMaterialGradeId;
                  obj.RMName = item.RawMaterialName;
                  obj.RawMaterialChildId = item.RawMaterialChildId;
                  obj.RMSpecification = item.RawMaterialSpecification;
                  obj.RawMaterialSpecificationId =
                    item.RawMaterialSpecificationId;

                  if (index > arrTemp?.length - 1) {
                    obj.PartId = arrTemp[0].PartId;
                    obj.PartNo = arrTemp[0].PartNo;
                    obj.Quantity = 0;
                    obj.isEdit = true;
                    dataList.push(obj);
                  } else {
                    Object.assign([...dataList], { index: obj });
                  }
                });

              let arr = [...partList, ...dataList];
              setPartList(arr);
              setValue("partNumber", "");

              setRequirementDate("");

              setValue("RMName", "");
              setValue("RMGrade", "");
              setValue("RMSpecification", "");
              setUpdateButtonPartNoTable(false);
              setRMName("");
              setRMGrade("");
              setRMSpecification("");
              dispatch(clearGradeSelectList([]));
              dispatch(clearSpecificationSelectList([]));
            })
          );
        })
      );
    } else {
      let objTemp = {};
      let arrTemp = [];
      let Data = {};
      const { label } = getValues("RMName") || {};
      const isRMGradeMissing = !getValues("RMGrade");
      const isRMSpecificationMissing = !getValues("RMSpecification");
      if (
        label !== undefined &&
        (isRMGradeMissing || isRMSpecificationMissing)
      ) {
        const missingRequirements = [];
        if (isRMGradeMissing) {
          missingRequirements.push("RM Grade");
        }
        if (isRMSpecificationMissing) {
          missingRequirements.push("RM Specification");
        }
        const message = `Please select ${missingRequirements.join(" and ")}`;
        Toaster.warning(message);
      } else if (getValues("HavellsDesignPart") === "") {
        Toaster.warning("Please select Havells Design part");
        return false;
      } else if (requirementDate === "") {
        Toaster.warning("Please select Requirement Date");
        return false;
      } else if (
        /* getTargetprice && Object.keys(getTargetprice).length === 0 */ targetPrice ===
          "" &&
        havellsDesignPart === "Havells Design part"
      ) {
        Toaster.warning(
          "ZBC costing approval is required for this plant to raise a quote."
        );
        return false;
      } else {
        if (nfrId && nfrId.value !== null) {
          //CHECK_NFR
          dispatch(
            getNfrAnnualForecastQuantity(
              nfrId.value,
              getValues("partNumber")?.value,
              (sopdate = ""),
              (res) => {
                Data = res.data.Data;
              }
            )
          );
        }
        let dataObj = {
          // Part Handle change
          PartIdList: [getValues("partNumber")?.value],
          PlantId: getValues("plant")?.value,
          VendorId: null,
        };

        let vendorList = [];
        let vendorListFinal = [];

        dispatch(
          checkExistCosting(dataObj, (res) => {
            // Part Handle change
            if (res?.data?.Result) {
              vendorList = [...res?.data?.DataList];
              vendorList &&
                vendorList?.map((item) => {
                  vendorListFinal.push(
                    `${item?.VendorName} (${item?.VendorCode})`
                  );
                });
            }

            let tempArrayparts = [...selectedparts, getValues("partNumber")];
            setSelectedParts(tempArrayparts);

            let partNumber = getValues("partNumber");

            let arrTemp = [];

            let newObjTemp = {}; // Initialize the new object

            newObjTemp.PartNumber = partNumber?.label;
            newObjTemp.PartId = getValues("partNumber")?.value;
            newObjTemp.UOM = getValues("UOM")?.label;
            newObjTemp.UOMId = getValues("UOM")?.value;
            newObjTemp.TargetPrice = getTargetprice?.TargetPrice || 0;
            newObjTemp.TimeLine = requirementDate.split(" ")[0] || "";
            newObjTemp.PartType = getValues("PartType")?.label;
            newObjTemp.PartTypeId = getValues("PartType")?.value;
            newObjTemp.HavellsDesignPart =
              getValues("HavellsDesignPart")?.label;
            newObjTemp.HavellsDesignPartId =
              getValues("HavellsDesignPart")?.value;
            newObjTemp.Description = getValues("Description");
            newObjTemp.SOPQuantityDetails = sopQuantityList;

            arrTemp.push(newObjTemp); // Push the new object to the array

            //let dataList = [...arrTemp]

            let arr = updateButtonPartNoTable
              ? partList.map((item) =>
                  item.PartId === getValues("partNumber")?.value
                    ? { ...item, ...arrTemp[0] }
                    : item
                )
              : [...partList, ...arrTemp];

            let obj = {};
            let temppartArr = [];
            let tempArr = [...arr];
            let list = [];
            list =
              tempArr &&
              tempArr?.map((item) => {
                if (isNaN(Number(item?.Quantity))) {
                  item.Quantity = 0;
                }
                return item;
              });

            obj.QuotationId = getQuotationIdForRFQ ? getQuotationIdForRFQ : "";
            obj.TechnologyId = getValues("technology").value;
            obj.PlantId = getValues("plant")?.value;
            obj.LoggedInUserId = loggedInUserId();
            let partIdList = _.uniq(_.map(list, "PartId"));

            let childPartIdList = _.uniq(_.map(tableData, "PartId"));
            partIdList &&
              partIdList?.map((item) => {
                if (item !== getValues("partNumber")?.value) return false;
                let temppartObj = {};
                let partListArr = [];
                let partObject = [];
                temppartObj.PartId = item;
                let obj = arr && arr?.filter((ele) => ele?.PartId === item);

                let rmList = [];
                if (isNFRFlow) {
                  let arrList =
                    rmAPIList &&
                    rmAPIList?.filter(
                      (element) => element?.partName?.value === item
                    )[0]?.RmList;
                  rmList =
                    arrList &&
                    arrList?.filter(
                      (element) =>
                        element?.RawMaterialChildId ||
                        element?.RawMaterialGradeId ||
                        element?.RawMaterialSpecificationId
                    );
                } else {
                  tableData &&
                    tableData.map((item2) => {
                      if (item2?.PartId === item) {
                        rmList = [
                          {
                            RawMaterialChildId:
                              item2?.RawMaterialChildId || null,
                            RawMaterialGradeId:
                              item2?.RawMaterialGradeId || null,
                            RawMaterialSpecificationId:
                              item2?.RawMaterialSpecificationId || null,
                          },
                        ];
                      }
                    });
                }

                temppartObj.RMDetails = rmList;
                temppartObj.SOPQuantityDetails = sopQuantityList;
                temppartObj.IsChildPart = false;
                // temppartObj.QuotationPartId = ""
                temppartObj.PartType = partType?.label || "";
                temppartObj.TargetPrice = getTargetprice?.TargetPrice || 0;
                temppartObj.TimeLine = requirementDate || "";
                temppartObj.Remarks = remark || null;
                temppartObj.Attachments = childPartFiles || [];
                temppartObj.HavellsDesignPart =
                  getValues("HavellsDesignPart")?.label || "";
                temppartObj.UnitOfMeasurementId = getValues("UOM")?.value || "";
                temppartObj.ExistingVendor = vendorList.join(",") || "";
                temppartObj.Description = getValues("Description") || null;
                temppartObj.SopDate = sopdate || null;
                //temppartObj.SOPQuantityDetails = obj[0]?.SOPQuantityDetails

                //ExistingVendor
                let PartSpecificationList = {};
                let PartSpecification = [];

                if (specificationList?.length > 0) {
                  specificationList.forEach((item) => {
                    let specObj = {
                      Specification: item?.Specification,
                      Value: item?.Value,
                      LoggedInUserId: loggedInUserId(),
                    };
                    PartSpecification.push(specObj);
                  });
                }

                // Populate PartSpecificationList object
                PartSpecificationList = {
                  QuotationPartIdRef: temppartObj?.PartId || 0,
                  PartSpecification: PartSpecification,
                };

                // Assuming temppartObj already exists and you're assigning PartSpecificationList to it
                temppartObj.PartSpecificationList = PartSpecificationList;

                temppartArr.push(temppartObj);
                // if (updateButtonPartNoTable) {
                //     let updatedarr = temppartArr[partIndex];
                //     const updatedSopQuantityList = sopQuantityList; // Store sopQuantityList in a constant
                //     if (updatedarr) {
                //         updatedarr.SOPQuantityDetails = updatedSopQuantityList;
                //         temppartArr[partIndex] = updatedarr;
                //     }
                // }

                // Child Part Details
                if (partType?.label === "Assembly") {
                  childPartIdList &&
                    childPartIdList.map((childItem) => {
                      tableData &&
                        tableData.map((item2) => {
                          if (item2?.PartId === childItem) {
                            let childPartObj = {};
                            childPartObj.PartId = item2?.PartId;
                            childPartObj.RMDetails = [
                              {
                                RawMaterialChildId: item2?.RawMaterialChildId,
                                RawMaterialGradeId: item2?.RawMaterialGradeId,
                                RawMaterialSpecificationId:
                                  item2?.RawMaterialSpecificationId,
                              },
                            ];
                            childPartObj.SOPQuantityDetails = [];
                            childPartObj.IsChildPart = true;
                            childPartObj.PartType = null;
                            childPartObj.QuotationPartId = "";
                            childPartObj.PartSpecificationList = {
                              QuotationPartIdRef: null,
                              PartSpecification: null,
                            };

                            childPartObj.HavellsDesignPart = null;
                            childPartObj.TargetPrice = null;
                            childPartObj.TimeLine = null;
                            childPartObj.UnitOfMeasurementId = null;
                            childPartObj.SopDate = null;
                            childPartObj.Remarks = null;
                            childPartObj.Description = null;
                            childPartObj.Attachments = [];
                            temppartArr.push(childPartObj);
                          }
                          return null;
                        });
                    });
                }

                return null;
              });

            let updatedPartList = [];
            if (updateButtonPartNoTable) {
              if (isPartDetailUpdate) {
                updatedPartList = temppartArr;
              } else if (!isPartDetailUpdate) {
                updatedPartList = [...storePartsDetail];
                updatedPartList[0] = {
                  ...updatedPartList[0], // Preserve existing properties
                  UnitOfMeasurementId: getValues("UOM")?.value || "",
                  HavellsDesignPart:
                    getValues("HavellsDesignPart")?.label || "",
                  TimeLine: requirementDate || "",
                };
              }
            } else {
              updatedPartList = temppartArr;
            }

            obj.PartList = updatedPartList; // Move this line inside the block

            //obj.PartList = updateButtonPartNoTable ? (isPartDetailUpdate ? temppartArr : storePartsDetail) : temppartArr

            let updatedArr = [];
            //

            dispatch(
              saveRfqPartDetails(obj, (res) => {
                if (res?.data?.Result) {
                  if (!updateButtonPartNoTable) {
                    Toaster.success(
                      "Part Details has been added successfully."
                    );
                  } else {
                    Toaster.success(
                      "Part Details has been updated successfully."
                    );
                  }

                  setPartIdentity(res?.data?.Identity);
                  // onResetPartNoTable();
                  // setTableData([]);
                  // setSpecificationList([]);
                  //
                  //
                  updatedArr = arr.map((obj) => {
                    if (obj.PartId === assemblyPartNumber.value) {
                      //
                      return { ...obj, QuotationPartId: res?.data?.Identity };
                    }
                    return obj;
                  });
                  //

                  setPartList(updatedArr);
                }
                const newIdentityArray = _.uniq(
                  _.map(updatedArr, "QuotationPartId")
                ); // Convert to number
                //
                setUniquePartList(newIdentityArray);
              })
            );

            setTimeout(() => {
              setValue("partNumber", "");
              setRequirementDate("");
              setValue("RMName", "");
              setValue("RMGrade", "");
              setValue("RMSpecification", "");
              setValue("PartType", "");
              setValue("HavellsDesignPart", "");
              setValue("UOM", "");
              setValue("Description", "");
              setUpdateButtonPartNoTable(false);
              setEditQuotationPart(false);
              setIsPartDeailUpdate(false);
              setRMName("");
              setRMGrade("");
              setRMSpecification("");
              // setAssemblyPartNumber("")
              setTableData([]);
              setSpecificationList([]);
              setSopQuantityList([]);
              setSOPDate("");
              setAssemblyPartNumber("");
              // setQuotationIdentity('');
              setStorePartsDetail([]);
              dispatch(clearGradeSelectList([]));
              dispatch(clearSpecificationSelectList([]));
              dispatch(setRfqPartDetails([]));
              //dispatch(setQuotationIdForRfq(""))
            }, 200);
          })
        );
      }
    }
  };

  const onResetPartNoTable = () => {
    setUpdateButtonPartNoTable(false);
    setValue("partNumber", "");
    setValue("annualForecastQuantity", "");
    setValue("RMName", "");
    setValue("RMGrade", "");
    setValue("RMSpecification", "");
    setValue("PartType", "");
    setValue("HavellsDesignPart", "");
    setValue("UOM", "");
    setValue("Description", "");
    setValue("SOPDate", "");
    setRequirementDate("");
    setUpdateButtonPartNoTable(false);
    setEditQuotationPart(false);
    setTableData([]);
    setSpecificationList([]);
    setSopQuantityList([]);
    setSOPDate("");
    setStorePartsDetail([]);

    // setValue('technology', "")
  };

  const bulkToggle = () => {
    setisBulkUpload(true);
  };

  const closeBulkUploadDrawer = () => {
    setisBulkUpload(false);
  };

  const onResetVendorTable = () => {
    setUpdateButtonVendorTable(false);
    setValue("vendor", "");
    setValue("contactPerson", "");
    setValue("WarrantyTerms", "");
    setValue("PaymentTerms", "");
    setValue("IncoTerms", "");
    setValue("LDClause", "");
    setGetReporterListDropDown([]);
  };
  const viewAddButtonIcon = (data, type) => {
    let className = "";
    let title = "";
    if (data === "EDIT") {
      className = "edit-icon-primary";
      title = "Edit";
    } else {
      className = "plus-icon-square";
      title = "Add";
    }
    if (type === "className") {
      return className;
    } else if (type === "title") {
      return title;
    }
  };

  /**
   * @method handleTechnologyChange
   * @description  USED TO HANDLE TECHNOLOGY CHANGE
   */
  const handleTechnologyChange = (newValue) => {
    if (newValue) {
      setPartNoDisable(false);
      setValue("partNumber", "");
      setTechnology(newValue);
    } else {
      setPartNoDisable(true);
    }
    setVendor("");
    setValue("vendor", "");
    setPartName("");
    setState(false);
    setShowTooltip(false);
    setTimeout(() => {
      setState(true);
      setTimeout(() => {
        setShowTooltip(true);
      }, 250);
    }, 500);
    reactLocalStorage.setObject("PartData", []);
  };
  const handlePlant = (newValue) => {
    if (newValue && newValue !== "") {
      setPlant(newValue);
    } else {
      setPlant("");
    }
    setVendor("");
    setValue("vendor", "");
  };
  const handleNfrChnage = (newValue) => {
    if (newValue && newValue !== "") {
      // setPartNoDisable(false)
      setValue("partNumber", "");
      setPartName("");
      reactLocalStorage.setObject("PartData", []);
      dispatch(getPlantSelectListByType(ZBC, "RFQ", newValue?.value, () => {}));
      setNfrId(newValue);
      setIsNFRFlow(true);
    } else {
      setNfrId(null);
      setIsNFRFlow(false);
    }
  };
  /**
   * @method handlePartChange
   * @description  USED TO HANDLE PART CHANGE
   */
  const handlePartTypeChange = (newValue) => {
    if (newValue && newValue !== "") {
      setPartType(newValue);
      setValue("PartNumber", "");
      setPart("");
      setPartTypeforRM(newValue.value);
    } else {
      setPartType([]);
    }
    setPartName([]);
    reactLocalStorage.setObject("PartData", []);
  };
  const handleVendorChange = (data) => {
    dispatch(
      getContactPerson(data.value, (res) => {
        setGetReporterListDropDown(res?.data?.SelectList);
        setValue("contactPerson", "");
      })
    );
    dispatch(
      getrRqVendorDetails(data.value, (res) => {
        const { PaymentTerms, IncoTerms, IncoTermIdRef, PaymentTermIdRef } =
          res?.data?.Data;
        setValue("IncoTerms", IncoTerms);
        setValue("PaymentTerms", PaymentTerms);
      })
    );
  };
  const vendorFilterList = async (inputValue) => {
    if (
      inputValue &&
      typeof inputValue === "string" &&
      inputValue.includes(" ")
    ) {
      inputValue = inputValue.trim();
    }
    const resultInput = inputValue.slice(0, searchCount);
    if (inputValue?.length >= searchCount && vendor !== resultInput) {
      let res;
      res = await getVendorNameByVendorSelectList(
        VBC_VENDOR_TYPE,
        resultInput,
        initialConfiguration?.IsCriticalVendorConfigured
          ? technology.value
          : "",
        initialConfiguration?.IsCriticalVendorConfigured ? plant.value : ""
      );
      setVendor(resultInput);
      let vendorDataAPI = res?.data?.SelectList;
      if (inputValue) {
        return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true);
      } else {
        return vendorDataAPI;
      }
    } else {
      if (inputValue?.length < searchCount) return false;
      else {
        let VendorData = reactLocalStorage?.getObject("Data");
        if (inputValue) {
          return autoCompleteDropdown(inputValue, VendorData, false, [], false);
        } else {
          return VendorData;
        }
      }
    }
  };

  const removeAddedParts = (arr) => {
    const filteredArray = arr.filter((item) => {
      return !selectedparts.some((element) => {
        return element.value === item.value;
      });
    });
    return filteredArray;
  };
  const handleHavellsDesignPart = (newValue) => {
    setHavellsDesignPart(newValue);
    if (updateButtonPartNoTable) {
      setStorePartsDetail((prevDetails) => {
        return prevDetails.map((item) => {
          if (item.PartId === getValues("partNumber")?.value) {
            return {
              ...item,
              UnitOfMeasurementId: getValues("UOM")?.value || null,
              HavellsDesignPart: newValue?.label || "",
              TimeLine: requirementDate || "",
            };
          } else {
            return {
              ...item,
              UnitOfMeasurementId: null,
              HavellsDesignPart: null,
              TimeLine: null,
            };
          }
        });
      });
    }
  };
  const partFilterList = async (inputValue, type) => {
    const resultInput = inputValue.slice(0, searchCount);
    const nfrChange = nfrId?.value;

    if (
      inputValue?.length >= searchCount &&
      (partName !== resultInput || nfrChange !== storeNfrId)
    ) {
      const res = await getPartSelectListWtihRevNo(
        resultInput,
        technology.value,
        nfrId?.value,
        type
      );

      setPartName(resultInput);
      setStoreNfrId(nfrId?.value);
      let partDataAPI = res?.data?.DataList;
      if (inputValue) {
        let temp = [
          ...autoCompleteDropdownPart(inputValue, partDataAPI, false, [], true),
        ];

        return removeAddedParts(temp);
      } else {
        return removeAddedParts([...partDataAPI]);
      }
    } else {
      if (inputValue?.length < searchCount) return false;
      else {
        let partData = reactLocalStorage.getObject("PartData");
        if (inputValue) {
          let arr = [
            ...autoCompleteDropdownPart(inputValue, partData, false, [], false),
          ];
          return removeAddedParts([...arr]);
        } else {
          return removeAddedParts([...partData]);
        }
      }
    }
  };
  const quantityHeader = (props) => {
    return (
      <div className="ag-header-cell-label">
        <span className="ag-header-cell-text d-flex">
          Annual Forecast Quantity
          <i
            className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `}
            id={"quantity-tooltip"}
          ></i>{" "}
        </span>
      </div>
    );
  };

  /**
   * @method beforeSaveCell
   * @description CHECK FOR ENTER NUMBER IN CELL
   */
  const beforeSaveCell = (props) => {
    let cellValue = props;
    if (cellValue === undefined) {
      return true;
    }
    if (cellValue && !/^[0-9]+(\.[0-9]+)?$/.test(cellValue)) {
      Toaster.warning("Please enter a valid positive number.");
      return false;
    }
    return true;
  };

  const afcFormatter = (props) => {
    let final = _.map(props?.node?.rowModel?.rowsToDisplay, "data");
    const cell = props?.value;
    const value = beforeSaveCell(cell);
    setPartList(final);
    let isEnable;
    if (getValues("nfrId")) {
      isEnable =
        dataProps?.isAddFlag && props.data.isEdit
          ? true
          : dataProps?.isViewFlag
          ? false
          : isEditAll && props.data.isEdit
          ? true
          : false;
    } else {
      isEnable = dataProps?.isAddFlag
        ? true
        : dataProps?.isViewFlag
        ? false
        : isEditAll
        ? true
        : false;
    }
    return (
      <>
        {
          <span
            className={`form-control custom-max-width-110px  ${
              isEnable ? "" : "disabled"
            }`}
          >
            {value ? Number(cell) : 0}
          </span>
        }
      </>
    );
  };

  const handleVisibilityMode = (value) => {
    if (value?.label === "Duration") {
      setDateAndTime("");
    }
    setVisibilityMode(value);
    setValue("startPlanDate", "");
    setValue("Time", "");
  };

  const partNumberFormatter = (props) => {
    const row = props?.data;
    const value = row?.RevisionNumber
      ? row?.PartNumber + " (" + row?.RevisionNumber + ")"
      : row?.PartNumber
      ? row?.PartNumber
      : "";
    return (
      <div className={`${value ? "font-ellipsis" : "row-merge"}`}>{value}</div>
    );
  };

  /**
   * @method handleSubmissionDateChange
   * @description handleSubmissionDateChange
   */
  const handleSubmissionDateChange = (value) => {
    setSubmissionDate(value);
    setIsWarningMessageShow(false);
  };

  const handleChangeDateAndTime = (value) => {
    const localCurrentDate = new Date();
    if (localCurrentDate.toLocaleDateString() !== value.toLocaleDateString()) {
      setMinHours(0);
      setMinMinutes(0);
      setDateAndTime(DayTime(value).format("YYYY-MM-DD HH:mm:ss"));
    } else {
      setMinHours(currentHours);
      setMinMinutes(currentMinutes);
      if (
        value.getHours() > currentHours
          ? true
          : value.getMinutes() > currentMinutes
      ) {
        setDateAndTime(DayTime(value).format("YYYY-MM-DD HH:mm:ss"));
      } else {
        const selectedDateTime = setHours(
          setMinutes(value, new Date().getMinutes()),
          new Date().getHours()
        );
        setDateAndTime(DayTime(selectedDateTime).format("YYYY-MM-DD HH:mm:ss"));
      }
    }
  };

  const tooltipToggle = () => {
    setViewTooltip(!viewTooltip);
  };

  const checkBoxHandler = () => {
    setIsConditionalVisible(!isConditionalVisible);
    setVisibilityMode("");
    setValue("VisibilityMode", "");
    setValue("startPlanDate", "");
    setValue("Time", "");
  };

  function getNextFiveYears(currentYear) {
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear + i);
    }
    return years;
  }

  const handleRequirementDateChange = (value) => {
    setRequirementDate(DayTime(value).format("YYYY-MM-DD HH:mm:ss"));
    if (updateButtonPartNoTable && !isPartDetailUpdate) {
      setStorePartsDetail((prevDetails) => {
        return prevDetails?.map((item) => {
          if (item.PartId === getValues("partNumber")?.value) {
            return {
              ...item,
              UnitOfMeasurementId: getValues("UOM")?.value || null,
              HavellsDesignPart: getValues("HavellsDesignPart")?.value || null,
              TimeLine: DayTime(value).format("YYYY-MM-DD HH:mm:ss") || null,
            };
          } else {
            return {
              ...item,
              UnitOfMeasurementId: null,
              HavellsDesignPart: null,
              TimeLine: null,
            };
          }
        });
      });
    }
  };

  const renderListingRM = (label) => {
    let opts1 = [];
    if (label === "rmname") {
      if (rawMaterialNameSelectList?.length > 0) {
        let opts = [...rawMaterialNameSelectList];
        opts &&
          opts?.map((item) => {
            if (item.Value === "0") return false;
            item.label = item.Text;
            item.value = item.Value;
            opts1.push(item);
            return null;
          });
      }
    }
    if (label === "rmgrade") {
      if (gradeSelectList?.length > 0) {
        let opts = [...gradeSelectList];
        opts &&
          opts?.map((item) => {
            if (item.Value === "0") return false;
            item.label = item.Text;
            item.value = item.Value;
            opts1.push(item);
            return null;
          });
      }
    }

    if (label === "rmspecification") {
      if (rmSpecification?.length > 0) {
        let opts = [...rmSpecification];
        opts &&
          opts?.map((item) => {
            if (item.Value === "0") return false;
            item.label = item.Text;
            item.value = item.Value;
            opts1.push(item);
            return null;
          });
      }
    }

    return opts1;
  };

  const handleRMName = (newValue) => {
    setRMName({ label: newValue?.label, value: newValue?.value });
    setRmNameSelected(true);
    dispatch(
      getRMGradeSelectListByRawMaterial(newValue.value, false, (res) => {})
    );
  };

  const handleRMGrade = (newValue) => {
    setRMGrade({ label: newValue?.label, value: newValue?.value });
    dispatch(fetchSpecificationDataAPI(newValue.value, (res) => {}));
  };

  const handleRMSpecification = (newValue) => {
    setRMSpecification({ label: newValue?.label, value: newValue?.value });
  };
  const handleChangeUOM = (newValue) => {
    setSelectedUOM(newValue);
    if (updateButtonPartNoTable) {
      setStorePartsDetail((prevDetails) => {
        return prevDetails.map((item) => {
          if (item.PartId === getValues("partNumber")?.value) {
            return {
              ...item,
              UnitOfMeasurementId: newValue?.value || null,
              HavellsDesignPart: getValues("HavellsDesignPart")?.value || null,
              TimeLine: requirementDate || "",
            };
          } else {
            return {
              ...item,
              UnitOfMeasurementId: null,
              HavellsDesignPart: null,
              TimeLine: null,
            };
          }
        });
      });
    }
  };
  const EditableCallback = (props) => {
    let value;
    if (getValues("nfrId")) {
      value =
        dataProps?.isAddFlag && props.data.isEdit
          ? true
          : dataProps?.isViewFlag
          ? false
          : isEditAll && props.data.isEdit
          ? true
          : false;
    } else {
      value = dataProps?.isAddFlag
        ? true
        : dataProps?.isViewFlag
        ? false
        : isEditAll
        ? true
        : false;
    }

    return value;
  };
  const DrawerToggle = () => {
    // if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
    setDrawerOpen(true);
  };
  const closeDrawer = (e, isUpdate) => {
    setIsPartDeailUpdate(isUpdate);
    setDrawerOpen(false);
  };
  const handlePartNoChange = (value) => {
    setAssemblyPartNumber(value);
    dispatch(
      getPartInfo(value?.value, (res) => {
        setValue("Description", res.data?.Data?.Description);
        setPartEffectiveDate(res.data.Data?.EffectiveDate);
      })
    );
    dispatch(
      getTargetPrice(
        plant?.value,
        value?.value,
        Number(technology?.value),
        (res) => {
          const { TargetPrice } = res?.data?.Data;
          setTargetPrice(TargetPrice !== undefined ? TargetPrice : "");
        }
      )
    );
  };

  const effectiveDateFormatter = (props) => {
    const cellValue = props?.valueFormatted
      ? props.valueFormatted
      : props?.value;
    return cellValue != null ? DayTime(cellValue).format("DD/MM/YYYY") : "";
  };

  const frameworkComponents = {
    hyphenFormatter: hyphenFormatter,
    buttonFormatterFirst: buttonFormatterFirst,
    buttonFormatterVendorTable: buttonFormatterVendorTable,
    customNoRowsOverlay: NoContentFound,
    partNumberFormatter: partNumberFormatter,
    sopFormatter: sopFormatter,
    EditableCallback: EditableCallback,
    afcFormatter: afcFormatter,
    quantityHeader: quantityHeader,
    effectiveDateFormatter: effectiveDateFormatter,
  };

  const VendorLoaderObj = { isLoader: VendorInputLoader };
  const plantLoaderObj = { isLoader: inputLoader };

  const [isPercentage, setIsPercentage] = useState(false);
  const toggleInputType = () => {
    setIsPercentage(!isPercentage);
  };

  const filterList = async (inputValue) => {
    if (
      inputValue &&
      typeof inputValue === "string" &&
      inputValue.includes(" ")
    ) {
      inputValue = inputValue.trim();
    }
    const resultInput = inputValue.slice(0, searchCount);
    if (inputValue?.length >= searchCount && vendorName !== resultInput) {
      let res;
      res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput);
      setVendorName(resultInput);
      let vendorDataAPI = res?.data?.SelectList;
      if (inputValue) {
        return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true);
      } else {
        return vendorDataAPI;
      }
    } else {
      if (inputValue?.length < searchCount) return false;
      else {
        let VendorData = reactLocalStorage?.getObject("Data");
        if (inputValue) {
          return autoCompleteDropdown(inputValue, VendorData, false, [], false);
        } else {
          return VendorData;
        }
      }
    }
  };
  // Table data Array
  const dataArray = [
    { rank: "Rank 1", bids: [1008, 1007, 1005, 1004, 1004] },
    { rank: "Rank 2", bids: [1008, 1007, 1005, 1004, 1004] },
    { rank: "Rank 3", bids: [1008, 1007, 1005, 1004, 1004] },
    { rank: "Rank 4", bids: [1008] }, // Example with fewer revisions
  ];
  // More Content in table

  const toggle = (index) => {
    setOpenDropdowns((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const labels = {
    rfqNumberLabel: "RFQ No",
    auctionNameLabel: "Auction Name",
    partTypeLabel: "Part Type",
    partNumberLabel: "Part No",
    rmNameLabel: "RM Name",
    rmGradeLabel: "RM Grade",
    rmSpecificationLabel: "RM Specification",
    rmCodeLabel: "RM Code",
    timeLabel: "Time",
    durationLabel: "Duration",
    endTimeLabel: "End Time",
    remainingTimeLabel: "Remaining Time",
  };
  const data = {
    rfqNumber: "12345",
    auctionName: "Auction A",
    partType: "Assembly",
    partNumber: "PN-6789",
    rmName: "John Doe",
    rmgrade: "RM Wide Test",
    rmSpecification: "CRCA D",
    rmCode: "RM-1000202",
    bopName: "Machine",
    bopNumber: "BOP-12345",
    bopCategory: "STD",
    time: "10:00",
    duration: "2:00",
    endTime: "12:00",
    remainingTime: "1:30",
  };

  const [time, setTime] = useState(formatTime(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isEditable) {
        setTime(formatTime(new Date()));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isEditable]);

  const handleEditClick = () => {
    setIsEditable((prev) => !prev);
  };

  const handleRefreshClick = () => {
    setTime(formatTime(new Date()));
  };

  function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  /**
   * @method render
   * @description Renders the component
   */

  return (
    <div className="container-fluid">
      <div className="signup-form">
        <div className="row">
          <div className="col-md-12">
            <div className="shadow-lgg login-formg">
              <div className="row">
                <div className="col-md-6">
                  <h1>
                    Comparison Auction / Bids
                    {!isViewFlag && (
                      <TourWrapper
                        buttonSpecificProp={{ id: "Comparsion_Bids_Form" }}
                        stepsSpecificProp={{
                          steps: Steps(t).RFQ_FORM,
                        }}
                      />
                    )}
                  </h1>
                </div>
                <div className="col-md-6">
                  <div className="d-flex flex-wrap refresh-div">
                    <label className="mb-0 pr-4">Refresh In:</label>
                    <div className="d-flex form-group inputbox withBorder align-items-center">
                      <input
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        disabled={!isEditable}
                        className="form-control"
                      />
                      <button
                        type="button"
                        onClick={handleEditClick}
                        title="Edit"
                        className="edit-details-btn ml-2 mr-3"
                      ></button>
                      <button
                        type="button"
                        onClick={handleRefreshClick}
                        class="user-btn mr5"
                        title="Auto Refresh"
                      >
                        <div class="refresh mr-0"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <form>
                  <Row className="comparison-row">
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>{labels.rfqNumberLabel}:</label>
                        <span>{data.rfqNumber}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>{labels.auctionNameLabel}:</label>
                        <span>{data.auctionName}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>{labels.partTypeLabel}:</label>
                        <span>{data.partType}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>{labels.partNumberLabel}:</label>
                        <span>{data.partNumber}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>{labels.rmNameLabel}:</label>
                        <span>{data.rmName}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>{labels.rmGradeLabel}:</label>
                        <span>{data.rmgrade}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>{labels.rmSpecificationLabel}:</label>
                        <span>{data.rmSpecification}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>{labels.rmCodeLabel}:</label>
                        <span>{data.rmCode}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>BOP No.:</label>
                        <span>{data.bopNumber}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>BOP Name:</label>
                        <span>{data.bopName}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>Category:</label>
                        <span>{data.bopCategory}</span>
                      </div>
                    </Col>
                  </Row>
                  <Row className="comparison-time-row">
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>Start Time(HH:MM):</label>
                        <span>{data.time}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>Duration(HH:MM):</label>
                        <span>{data.duration}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>End Time(HH:MM):</label>
                        <span>{data.endTime}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>Remaining Time(HH:MM):</label>
                        <span>{data.remainingTime}</span>
                      </div>
                    </Col>
                  </Row>
                  <div className="rfq-part-list mt-4 add-min-height">
                    {/* {showTooltip && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={viewTooltip} toggle={tooltipToggle} target={"quantity-tooltip"} >{"To edit the quantity please double click on the field."}</Tooltip>} */}
                    {!loader ? (
                      <div className="comparision-table">
                        <Row>
                          <Col>
                            <table className="table table-bordered table-responsive costing-summary-table">
                              <thead>
                                <tr className="main-row">
                                  {dataArray.map((item, index) => (
                                    <th
                                      key={index}
                                      scope="col"
                                      className="header-name-left header-name"
                                    >
                                      <div className="header-name-button-container">
                                        <div className="element d-inline-flex align-items-center">
                                          <span
                                            className="checkbox-text"
                                            title={`BhuVendorTwo(SOB: 0%)`}
                                          >
                                            <div>
                                              <span>{item.rank}</span>
                                            </div>
                                          </span>
                                        </div>
                                        <div className="action text-right">
                                          <button
                                            type="button"
                                            className="CancelIcon mb-0 align-middle"
                                            title="Discard"
                                          ></button>
                                        </div>
                                      </div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  {dataArray.map((item, index) => (
                                    <td key={index}>
                                      <div className="bid-details-wrapper">
                                        {item.bids.map((bid, idx) => (
                                          <span
                                            key={idx}
                                            className="d-flex justify-content-between align-items-center pie-chart-container"
                                          >
                                            <span>
                                              <strong>
                                                {idx === item.bids.length - 2
                                                  ? "Current Bid"
                                                  : `${
                                                      idx === 0
                                                        ? "First"
                                                        : `${idx}th`
                                                    } Revision`}
                                              </strong>
                                            </span>
                                            <span className="pie-chart-wrapper pie-chart-wrapper-1">
                                              {bid}
                                            </span>
                                          </span>
                                        ))}
                                      </div>
                                      <div
                                        className="d-flex p-0 bids-dropdown"
                                        key={index}
                                      >
                                        <Dropdown
                                          isOpen={openDropdowns[index]}
                                          toggle={() => toggle(index)}
                                        >
                                          <DropdownToggle
                                            caret={false}
                                            className="bids-btn mt-1 mb-3"
                                          >
                                            More
                                          </DropdownToggle>
                                          <DropdownMenu className="bids-dropdown-menu">
                                            <DropdownItem>
                                              {item.bids.map((bid, idx) => (
                                                <span
                                                  key={idx}
                                                  className="d-flex justify-content-between align-items-center pie-chart-container"
                                                >
                                                  <span>
                                                    <strong>
                                                      {idx ===
                                                      item.bids.length - 1
                                                        ? "Current Bid"
                                                        : `${
                                                            idx === 0
                                                              ? "First"
                                                              : `${idx}th`
                                                          } Revision`}
                                                    </strong>
                                                  </span>
                                                  <span className="pie-chart-wrapper pie-chart-wrapper-1">
                                                    {bid}
                                                  </span>
                                                </span>
                                              ))}
                                            </DropdownItem>
                                          </DropdownMenu>
                                        </Dropdown>
                                      </div>
                                      <label className="custom-checkbox w-auto mb-0">
                                        Display Rank to Vendor
                                        <input
                                          type="checkbox"
                                          value={"All"}
                                          id={`checkbox-diplay${index + 1}`}
                                        />
                                        <span className="before-box p-0"></span>
                                      </label>
                                      <br />
                                      <button
                                        type="button"
                                        className="submit-button save-btn mr-2"
                                        value="save"
                                        id="addRFQ_save"
                                        onClick={handleCounterPopup}
                                      >
                                        Counter Offer
                                      </button>
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          </Col>
                        </Row>
                      </div>
                    ) : (
                      <div>
                        <LoaderCustom />
                      </div>
                    )}
                  </div>

                  <Row className="justify-content-between sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer mt-4">
                    <div className="col-sm-12 text-right bluefooter-butn">
                      <button
                        id="addRFQ_cancel"
                        type={"button"}
                        className="reset mr-2 cancel-btn"
                        onClick={cancel}
                      >
                        <div className={"cancel-icon"}></div>
                        {"Extend Time"}
                      </button>

                      {
                        <button
                          type="button"
                          className="submit-button save-btn mr-2"
                          value="save"
                          // {!dataProps?.rowData?.IsSent && <button type="button" className="submit-button save-btn mr-2" value="save"     //RE
                          id="addRFQ_save"
                          onClick={(data, e) =>
                            handleSubmitClick(data, e, false)
                          }
                          disabled={
                            isViewFlag ||
                            (showSendButton === PREDRAFT && disabledPartUid)
                          }
                        >
                          <div className={"save-icon"}></div>
                          {"Close Bid"}
                        </button>
                      }
                      {!isDropdownDisabled && (
                        <button
                          type="button"
                          className="submit-button save-btn"
                          value="send"
                          id="addRFQ_send"
                          onClick={(data, e) =>
                            handleSubmitClick(data, e, true)
                          }
                          disabled={
                            isViewFlag ||
                            (showSendButton === PREDRAFT && disabledPartUid)
                          }
                        >
                          <div className="send-for-approval mr-1"></div>
                          {"Send for Approval"}
                        </button>
                      )}
                    </div>
                  </Row>
                </form>

                {isBulkUpload && (
                  <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={closeBulkUploadDrawer}
                    isEditFlag={false}
                    // densityAlert={densityAlert}
                    fileName={"ADD RFQ"}
                    messageLabel={"RFQ Part's"}
                    anchor={"right"}
                    technologyId={technology}
                    // isFinalApprovar={isFinalLevelUser}
                  />
                )}
                {drawerOpen && (
                  <ProcessDrawer
                    isOpen={drawerOpen}
                    anchor={"right"}
                    closeDrawer={closeDrawer}
                    isEditFlag={editQuotationPart}
                    dataProp={dataProps}
                    technology={technology}
                    nfrId={nfrId}
                    partName={partName}
                    AssemblyPartNumber={assemblyPartNumber}
                    type={partTypeforRM}
                    tableData={tableData}
                    setTableData={setTableData}
                    specificationList={specificationList}
                    setSpecificationList={setSpecificationList}
                    setChildPartFiles={setChildPartFiles}
                    childPartFiles={childPartFiles}
                    setRemark={setRemark}
                    remark={remark}
                    isViewFlag={viewQuotationPart}
                    partListData={partList}
                    setPartListData={setPartList}
                    setViewQuotationPart={setViewQuotationPart}
                    addRowPartNoTable={addRowPartNoTable}
                    setSopQuantityList={setSopQuantityList}
                    sopQuantityList={sopQuantityList}
                    sopdate={sopdate}
                    setSOPDate={setSOPDate}
                    effectiveMinDate={effectiveMinDate}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* </Drawer > */}
      {showPopup && (
        <PopupMsgWrapper
          disablePopup={alreadyInDeviation}
          vendorId={vendorId}
          plantId={plantId}
          redirectPath={blocked ? "/initiate-unblocking" : ""}
          isOpen={showPopup}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm}
          message={blocked ? `${popupMessage}` : `${MESSAGES.RFQ_ADD_SUCCESS}`}
        />
      )}
      {showCounterPopup && (
        <PopupMsgWrapper
          header={"Counter Offer"}
          isOpen={showCounterPopup}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm}
          customClass={"counterOfferModal"}
          message={
            <>
              <TextFieldHookForm
                // title={titleObj.descriptionTitle}
                label="Counter Offer:"
                name={"AuctionName"}
                Controller={Controller}
                control={control}
                register={register}
                rules={{ required: false }}
                mandatory={false}
                handleChange={() => {}}
                defaultValue={""}
                className=""
                customClassName={
                  "withBorder d-flex align-items-center justify-content-center"
                }
                errors={errors.AuctionName}
              />
            </>
          }
        />
      )}
    </div>
  );
}

export default ComparsionAuction;
