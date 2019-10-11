import React from 'react';
import {Row ,Col} from 'reactstrap';

const LabelComponent = ({ label, mandatory }) => {
  if (mandatory == undefined || mandatory == false) {
    return (
      <Row >{label}</Row>
    );
  } else {
    return (
      <div>{label}<Row style={{ color: 'red' }}> *</Row></div>
    );
  }
};

export { LabelComponent };

