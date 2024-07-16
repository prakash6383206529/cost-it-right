// App.js
import React, { useEffect, useState } from 'react';
import Table from './Table';
import { useDispatch, useSelector } from 'react-redux';
import DayTime from '../../common/DayTimeWrapper';
import LoaderCustom from '../../common/LoaderCustom';
import { getViewBOPDetails } from '../../masters/actions/BoughtOutParts';

const BOPCompareTable = (props) => {

    const dispatch = useDispatch()
    const { viewBOPDetails } = useSelector((state) => state.boughtOutparts);



    const [sectionData, setSectionData] = useState([])
    const [mainHeadingData, setMainHeadingData] = useState([])
    const [checkBoxCheck, setCheckBoxCheck] = useState({})
    const [selectedRows, setSelectedRows] = useState([])
    const [isLoader, setIsLoader] = useState(false)
    useEffect(() => {
        setIsLoader(true)
        const idArr = props.selectedRows.map(item => item.BoughtOutPartId)

        dispatch(getViewBOPDetails(idArr, res => { setIsLoader(false) }))
    }, [])
    useEffect(() => {
        if (viewBOPDetails.length !== 0) {
            let sectionOne = [];
            let sectionTwo = [];
            let sectionThree = []
            let sectionOneHeader = ["BOP No.", "BOP Name", "Category", "UOM", /* "Specification", */ 'Plant (Code)', "vendor (Code)", 'Effective Date', 'Basic Rate']
            let sectionTwoHeader = ['CutOff Price', 'Scrap Rate', 'BOP Shearing Cost', 'BOP Freight Cost', 'BOP Net Cost']
            let sectionThreeHeader = ['Remark']
            let mainHeader = []
            viewBOPDetails.map((item, index) => {
                //section one data start
                const effectiveDate = <input className='form-control defualt-input-value' disabled={true} value={DayTime(item.EffectiveDate).format('DD/MM/YYYY')} />
                const formattedDataOne = [
                    item.BoughtOutPartNumber,
                    item.BoughtOutPartName,
                    item.BoughtOutPartCategory,
                    item.UOM,
                    /*  item.BoughtOutPartSpecificationName, */
                    item.Plants,
                    item.Vendor,
                    effectiveDate,
                    item.BasicRatePerUOM
                ];
                sectionOne.push(formattedDataOne);

                //section two data start
                const formattedDataTwo = [
                    item.CutOffPrice,
                    item.ScrapRate,
                    item.RMShearingCost,
                    item.RMFreightCost,
                    item.NetLandedCost
                ]
                sectionTwo.push(formattedDataTwo)

                //section Three
                sectionThree.push([item.Remark])

                //mainheader data start
                const mainHeaderObj = {
                    vendorName: item.Vendor,
                    onChange: () => checkBoxHanlde(item, index),
                    checked: checkBoxCheck[index],
                    isCheckBox: item.IsShowCheckBoxForApproval

                }
                mainHeader.push(mainHeaderObj)
            })
            const sectionOneDataObj = {
                header: sectionOneHeader,
                data: sectionOne,
                isHighlightedRow: true,
            }
            const sectionTwoDataObj = {
                header: sectionTwoHeader,
                data: sectionTwo,
                isHighlightedRow: true,
            }
            const sectionThreeDataObj = {
                header: sectionThreeHeader,
                data: sectionThree,
                isHighlightedRow: false,
            }
            setSectionData([sectionOneDataObj, sectionTwoDataObj, sectionThreeDataObj])
            setMainHeadingData(mainHeader)
        }
    }, [viewBOPDetails])

    const checkBoxHanlde = (index, item) => {
        let selectedData = []
        selectedData.push(item?.BoughtOutPartId)


        setCheckBoxCheck(prevState => ({ ...prevState, index: true }))
        props.checkCostingSelected(selectedData, index)
    }
    return (
        <div>
            <Table headerData={mainHeadingData} sectionData={sectionData}>
                {isLoader && <LoaderCustom customClass="" />}
            </Table>
        </div>
    );
};
export default BOPCompareTable;
