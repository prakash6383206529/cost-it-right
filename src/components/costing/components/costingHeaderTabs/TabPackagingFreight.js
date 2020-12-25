import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getPackageFreightTabData, saveCostingPackageFreightTab } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import PackageAndFreight from '../CostingHeadCosts/PackageAndFreight';

function TabPackagingFreight(props) {

  const { handleSubmit, } = useForm();

  const [tabData, setTabData] = useState([]);
  const [packageTotal, setPackageTotal] = useState(0);
  const [freightTotal, setFreightTotal] = useState(0);

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        //PlantId: costData.PlantId,
      }
      dispatch(getPackageFreightTabData(data, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.Data;
          setTabData(Data.CostingPartDetails)
        }
      }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    let topHeaderData = {
      NetFreightPackagingCost: checkForNull(packageTotal) + checkForNull(freightTotal),
      FreightNetCost: freightTotal,
      PackagingNetCost: packageTotal,
    }
    props.setHeaderCost(topHeaderData)
  }, [tabData]);

  const toggle = (index) => {
    let tempData = tabData[index];
    let tempObj = { ...tempData, IsOpen: !tempData.IsOpen }
    let tempArr = Object.assign([...tabData], { [index]: tempObj })
    setTabData(tempArr)
  }

  /**
  * @method setPackageCost
  * @description SET PACKAGE COST
  */
  const setPackageCost = (GridData, index) => {
    let tempObj = tabData[index];
    console.log('GridData: ', GridData);

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          PackagingNetCost: packageTotalCost(GridData),
          NetFreightPackagingCost: tempObj.FreightNetCost !== null ? tempObj.FreightNetCost : 0 + packageTotalCost(GridData),
          CostingPackagingDetail: GridData
        })
    })

    setTimeout(() => {
      setPackageTotal(packageTotalCost(GridData))
      setTabData(tempArr)
    }, 200)

  }

  /**
  * @method packageTotalCost
  * @description GET TOTAL PACKAGE COST
  */
  const packageTotalCost = (item) => {
    let cost = 0;
    cost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.PackagingCost);
    }, 0)
    return cost;
  }

  /**
  * @method setFreightCost
  * @description SET FREIGHT COST
  */
  const setFreightCost = (GridData, index) => {
    let tempObj = tabData[index];

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          FreightNetCost: freightTotalCost(GridData),
          NetFreightPackagingCost: tempObj.PackagingNetCost + freightTotalCost(GridData),
          CostingFreightDetail: GridData
        })
    })

    setTimeout(() => {
      setFreightTotal(freightTotalCost(GridData))
      setTabData(tempArr)
    }, 200)

  }

  /**
  * @method freightTotalCost
  * @description GET TOTAL FREIGHT COST
  */
  const freightTotalCost = (item) => {
    let cost = 0;
    cost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.FreightCost);
    }, 0)
    return cost;
  }

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {
    const data = {
      "CostingId": costData.CostingId,
      "PartId": costData.PartId,
      "PartNumber": costData.PartNumber,
      "NetPOPrice": props.netPOPrice,
      "LoggedInUserId": loggedInUserId(),
      "FreightNetCost": checkForNull(freightTotal),
      "PackagingNetCost": checkForNull(packageTotal),
      "NetFreightPackagingCost": checkForNull(packageTotal) + checkForNull(freightTotal),
      "CostingPartDetails": tabData
    }

    dispatch(saveCostingPackageFreightTab(data, res => {
      console.log('saveCostingPackageFreightTab: ', res);
    }))

  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {


  }

  return (
    <>
      <div className="login-container signup-form">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">
              <Row>
                <Col md="6">
                  <div className="form-heading mb-0">
                    <h2>{''}</h2>
                  </div>
                </Col>
              </Row>

              <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >

                <Row>
                  <Col md="12">
                    <Table className="table cr-brdr-main" size="sm">
                      <thead>
                        <tr>
                          <th style={{ width: '100px' }}>{``}</th>
                          <th style={{ width: '100px' }}>{`Net Packaging Cost`}</th>
                          <th style={{ width: '150px' }}>{`Net Freight Cost`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          tabData && tabData.map((item, index) => {
                            return (
                              < >
                                <tr key={index} onClick={() => toggle(index)}>
                                  <td>{item.PartName}</td>
                                  <td>{item.PackagingNetCost !== null ? checkForDecimalAndNull(item.PackagingNetCost, 2) : 0}</td>
                                  <td>{item.FreightNetCost !== null ? checkForDecimalAndNull(item.FreightNetCost, 2) : 0}</td>
                                </tr>
                                {item.IsOpen &&
                                  <tr>
                                    <td colSpan={3}>
                                      <div>
                                        <PackageAndFreight
                                          index={index}
                                          packageData={item.CostingPackagingDetail}
                                          freightData={item.CostingFreightDetail}
                                          setPackageCost={setPackageCost}
                                          setFreightCost={setFreightCost}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                }
                              </>
                            )
                          })
                        }

                      </tbody>
                    </Table>
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between mt25">
                  <div className="col-sm-12 text-right bluefooter-butn">

                    <button
                      type={'button'}
                      className="submit-button mr5 save-btn"
                      onClick={saveCosting}>
                      <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                      {'Save'}
                    </button>
                  </div>
                </Row>

              </form>
            </div>
          </Col>
        </Row>
      </div>

    </>
  );
};

export default TabPackagingFreight;