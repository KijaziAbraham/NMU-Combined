import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

const EditPrototype = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [hasPhysicalPrototype, setHasPhysicalPrototype] = useState(false);
  const [report, setReport] = useState(null);
  const [sourceCode, setSourceCode] = useState(null);

  useEffect(() => {
    const fetchPrototype = async () => {
      try {
        const response = await api.get(`prototypes/${id}/`);
        setTitle(response.data.title);
        setAbstract(response.data.abstract);
        setHasPhysicalPrototype(response.data.has_physical_prototype);
        setReport(response.data.report);
        setSourceCode(response.data.source_code);
      } catch (error) {
        console.error("Error fetching prototype:", error);
        alert("Failed to load prototype details.");
        navigate("/dashboard");
      }
    };
    fetchPrototype();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("title", title);
    formData.append("abstract", abstract);
    formData.append("has_physical_prototype", hasPhysicalPrototype);

    if (report) formData.append("attachment.report", report);
    if (sourceCode) formData.append("attachment.source_code", sourceCode);

    try {
      await api.patch(`prototypes/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Prototype updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating prototype:", error);
      alert("Failed to update prototype.");
    }
  };

  return (
    <div>
      <h2>Edit Prototype</h2>
      <form onSubmit={handleUpdate}>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Abstract:</label>
        <textarea
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          required
        />

        <label>
          <input
            type="checkbox"
            checked={hasPhysicalPrototype}
            onChange={(e) => setHasPhysicalPrototype(e.target.checked)}
          />
          Has Physical Prototype?
        </label>

        {/* File input for report */}
        <label>Report:</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt,.rtf"
          onChange={(e) => setReport(e.target.files[0])}
        />

        {/* File input for source code */}
        <label>Source Code:</label>
        <input
          type="file"
          accept=".zip,.rar,.tar,.tar.gz"
          onChange={(e) => setSourceCode(e.target.files[0])}
        />

        <button type="submit">Update Prototype</button>
      </form>
    </div>
  );
};

export default EditPrototype;
