import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../api/api";

const AssignStorageModal = ({ show, onHide, prototypeId }) => {
  const [storageLocation, setStorageLocation] = useState("");

  useEffect(() => {
    if (prototypeId) {
      fetchPrototypeDetails();
    }
  }, [prototypeId]);

  const fetchPrototypeDetails = async () => {
    try {
      const response = await api.get(`prototypes/${prototypeId}/`);
      setStorageLocation(response.data.storage_location || "");
    } catch (error) {
      console.error("Error fetching prototype details:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await api.post(
        `prototypes/${prototypeId}/assign_storage/`,
        { storage_location: storageLocation }
      );
      alert("Storage location updated successfully!");
      onHide(); // Close modal
    } catch (error) {
      console.error("Error assigning storage:", error);
      alert("Failed to assign storage.");
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Storage Location</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="storageLocation">
            <Form.Label>Storage Location</Form.Label>
            <Form.Control
              type="text"
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
              placeholder="Enter storage location"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignStorageModal;
