// App.js
import React, { useEffect, useState } from 'react';
import Table from './Table';
import { useDispatch, useSelector } from 'react-redux';
import { getViewRawMaterialDetails } from '../../masters/actions/Material';
import DayTime from '../../common/DayTimeWrapper';
import LoaderCustom from '../../common/LoaderCustom';

const RMCompareTable = (props) => {
    const dispatch = useDispatch()
    const { viewRmDetails } = useSelector(state => state.material)
    const [sectionData, setSectionData] = useState([])
    const [mainHeadingData, setMainHeadingData] = useState([])
    const [checkBoxCheck, setCheckBoxCheck] = useState({})
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedIndices, setSelectedIndices] = useState([])
        const [isLoader, setIsLoader] = useState(false)
    useEffect(() => {
        setIsLoader(true)
        const idArr = props.selectedRows.map(item => item.RawMaterialId)
        dispatch(getViewRawMaterialDetails(idArr, res => { setIsLoader(false) }))
    }, [])
    useEffect(() => {
        if (viewRmDetails.length !== 0) {
            let sectionOne = [];
            let sectionTwo = [];
            let sectionThree = []
            let sectionOneHeader = ['Technology', 'Plant (Code)', 'RM Code', 'RM Name-Grade', 'RM Specification', 'Category', 'Effective Date', 'Basic Rate']
            let sectionTwoHeader = ['CutOff Price', 'Scrap Rate', 'RM Shearing Cost', 'RM Freight Cost', 'RM Net Cost']
            let sectionThreeHeader = ['Remark']
            let mainHeader = []
            viewRmDetails.map((item, index) => {
                //section one data start
                const RMNameGrade = `${item.RawMaterialName}-${item.RawMaterialGradeName}`;
                const effectiveDate = <input className='form-control defualt-input-value' disabled={true} value={DayTime(item.EffectiveDate).format('DD/MM/YYYY')} />
                const formattedDataOne = [
                    item.TechnologyName,
                    item.DestinationPlantName,
                    item.RawMaterialCode,
                    RMNameGrade,
                    item.RawMaterialSpecificationName,
                    item.RawMaterialCategoryName,
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
                    vendorName: item.VendorName,
                    onChange: () => checkBoxHandle(item,index),
                    checked: checkBoxCheck[index],
                    isCheckBox: true

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
    }, [viewRmDetails])
    const checkBoxHandle = (item, index) => {
        setCheckBoxCheck(prevState => {
            const newState = { ...prevState, [index]: !prevState[index] }
            return newState
        })

        setSelectedItems(prevItems => {
            let newItems
            if (prevItems.some(i => i.RawMaterialId === item.RawMaterialId)) {
                newItems = prevItems.filter(i => i.RawMaterialId !== item.RawMaterialId)
            } else {
                newItems = [...prevItems, item]
            }
            return newItems
        })

        setSelectedIndices(prevIndices => {
            let newIndices
            if (prevIndices.includes(index)) {
                newIndices = prevIndices.filter(i => i !== index)
            } else {
                newIndices = [...prevIndices, index]
            }
            return newIndices
        })
    }
    
    useEffect(() => {
        props.checkCostingSelected(selectedItems, selectedIndices)
    }, [selectedItems, selectedIndices])
    // const checkBoxHanlde = (item , index) => {
    //     setCheckBoxCheck(prevState => ({ ...prevState, index: true }))
    //     props.checkCostingSelected(item,index)
    // }
    return (
        <div>
            <Table headerData={mainHeadingData} sectionData={sectionData}>
                {isLoader && <LoaderCustom customClass="" />}
            </Table>
        </div>
    );
};
export default RMCompareTable;
