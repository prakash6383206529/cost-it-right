// UnblockClassification.js
import React, { useState } from 'react';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';

const UnblockClassification = () => {
    const [reason, setReason] = useState('');
    const [deviationDuration, setDeviationDuration] = useState('');
    const [remark, setRemark] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle submission for Vendor Classification

    };

    return (
        <div>
            <h3>Unblocking Supplier Classification</h3>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label for="reason">Select Reason</Label>
                    <Input type="select" name="reason" id="reason" value={reason} onChange={(e) => setReason(e.target.value)} required>
                        {/* Dropdown options */}
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="deviationDuration">Deviation Duration For Classification*</Label>
                    <Input type="select" name="deviationDuration" id="deviationDuration" value={deviationDuration} onChange={(e) => setDeviationDuration(e.target.value)} required>
                        {/* Dropdown options for duration */}
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="remark">Add Remark*</Label>
                    <Input type="textarea" name="remark" id="remark" value={remark} onChange={(e) => setRemark(e.target.value)} required />
                </FormGroup>
                <Button color="primary" type="submit">Submit</Button>
            </Form>
        </div>
    );
};

export default UnblockClassification;
