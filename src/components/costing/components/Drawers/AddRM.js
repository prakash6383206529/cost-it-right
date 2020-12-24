import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { getRMDrawerDataList, getRMDrawerVBCDataList } from '../../actions/Costing';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import NoContentFound from '../../../common/NoContentFound';
import { CONSTANT } from '../../../../helper/AllConastant';
import { GridTotalFormate } from '../../../common/TableGridFunctions';
import { toastr } from 'react-redux-toastr';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { ZBC } from '../../../../config/constants';

function AddRM(props) {

  const [tableData, setTableDataList] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext)

  useEffect(() => {
    if (costData.VendorType === ZBC) {

      const data = {
        PlantId: costData.PlantId,
        CostingId: costData.CostingId,
      }
      dispatch(getRMDrawerDataList(data, (res) => {
        if (res && res.status === 200) {
          let Data = res.data.DataList;
          setTableDataList(Data)
        } else if (res && res.response && res.response.status === 412) {
          setTableDataList([])
        } else {
          setTableDataList([])
        }
      }))

    } else {

      const data = {
        VendorId: costData.VendorId,
        VendorPlantId: costData.VendorPlantId,
        CostingId: costData.CostingId,
      }
      dispatch(getRMDrawerVBCDataList(data, (res) => {
        if (res && res.status === 200) {
          let Data = res.data.DataList;
          setTableDataList(Data)
        } else if (res && res.response && res.response.status === 412) {
          setTableDataList([])
        } else {
          setTableDataList([])
        }
      }))

    }
  }, []);

  /**
  * @method renderPaginationShowsTotal
  * @description Pagination
  */
  const renderPaginationShowsTotal = (start, to, total) => {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  const options = {
    clearSearch: true,
    noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
    paginationShowsTotal: renderPaginationShowsTotal(),
    paginationSize: 5,
  };

  const onRowSelect = (row, isSelected, e) => {
    setSelectedRowData(row)
  }

  const onSelectAll = (isSelected, rows) => {

  }

  const selectRowProp = {
    mode: 'radio',
    //selected: ['f2e2f8c2-6914-4660-9844-26e7fea83b4e'],
    onSelect: onRowSelect,
    //onSelectAll: onSelectAll
  };

  /**
 * @method buttonFormatter
 * @description Renders buttons
 */
  const checkBoxFormatter = (cell, row, enumObject, rowIndex) => {
    return (
      <>
        <input
          type="checkbox"
          checked={true}
          disabled={false}
        />
      </>
    )
  }

  const renderBasicRate = () => {
    return <>Basic Rate <br />INR/UOM </>
  }

  const renderScrapRate = () => {
    return <>Scrap Rate <br /> INR/UOM </>
  }

  const renderNetLandedRate = () => {
    return <>Net Landed Cost <br /> INR/UOM</>
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    props.closeDrawer()
  }

  /**
  * @method addRow
  * @description ADD ROW IN TO RM COST GRID
  */
  const addRow = () => {
    if (selectedRowData.length === 0) {
      toastr.warning('Please select row.')
      return false;
    }
    toggleDrawer('')
  }

  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('', selectedRowData)
  };

  const onSubmit = data => {
    toggleDrawer('')
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer anchor={props.anchor} open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
        <Container>
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'ADD RM'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>

            <Row>
              <Col>
                <BootstrapTable
                  data={tableData}
                  striped={false}
                  bordered={false}
                  hover={false}
                  options={options}
                  selectRow={selectRowProp}
                  search
                  multiColumnSearch={true}
                  //exportCSV
                  //ignoreSinglePage
                  //ref={'table'}
                  pagination>
                  <TableHeaderColumn dataField="RawMaterialId" isKey={true} hidden width={100} dataAlign="center" searchable={false} >{''}</TableHeaderColumn>
                  {/* <TableHeaderColumn dataField="" width={100} dataAlign="center" searchable={false} dataFormat={checkBoxFormatter} >{''}</TableHeaderColumn> */}
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="EntryType"  >{'RM Type'}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="RawMaterial" >{'RM Name'}</TableHeaderColumn>
                  <TableHeaderColumn width={70} columnTitle={true} dataAlign="center" dataField="RMGrade" >{'RM Grade'}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="RMSpec" >{'RM Spec'}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="Category" searchable={false} >Category</TableHeaderColumn>
                  {costData && costData.VendorType === ZBC && <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="VendorName" >Vendor</TableHeaderColumn>}
                  {costData && costData.VendorType === ZBC && <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="VendorLocation" searchable={false} >Vendor Location</TableHeaderColumn>}
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="Currency" searchable={false} >Currency</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="UOM" searchable={false} >UOM</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="BasicRatePerUOM" searchable={false} >{renderBasicRate()}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="ScrapRate" searchable={false} >{renderScrapRate()}</TableHeaderColumn>
                  <TableHeaderColumn width={120} columnTitle={true} dataAlign="center" dataField="NetLandedCost" searchable={false} >{renderNetLandedRate()}</TableHeaderColumn>
                </BootstrapTable>
              </Col>
            </Row>

            <Row className="sf-btn-footer no-gutters justify-content-between">
              <div className="col-sm-12 text-left bluefooter-butn">
                <button
                  type={'button'}
                  className="submit-button mr5 save-btn"
                  onClick={addRow} >
                  <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                  {'SELECT'}
                </button>

                <button
                  type={'button'}
                  className="reset mr15 cancel-btn"
                  onClick={cancel} >
                  <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                </button>
              </div>
            </Row>

          </div>
        </Container>
      </Drawer>
    </div>
  );
}

export default React.memo(AddRM);