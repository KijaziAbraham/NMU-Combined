import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

const ReviewPrototype = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prototype, setPrototype] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetchPrototype();
  }, []);

  const fetchPrototype = async () => {
    try {
      const response = await api.get(`prototypes/${id}/`);
      setPrototype(response.data);
    } catch (error) {
      console.error("Error fetching prototype:", error);
      alert("Failed to load prototype details.");
      navigate("/dashboard");
    }
  };

  const handleReview = async () => {
    if (!feedback.trim()) {
      alert("Please provide feedback before submitting.");
      return;
    }

    try {
      // Ensure the correct content type and pass the feedback
      await api.post(
        `prototypes/${id}/review_prototype/`,
        {
          feedback, // Send only feedback here
        },
        {
          headers: {
            'Content-Type': 'application/json', // Set the correct content type
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include JWT token for authorization
          }
        }
      );

      alert("Review submitted successfully.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    }
  };

  if (!prototype) return <p>Loading prototype details...</p>;

  return (
    <div>
      <h2>Review Prototype</h2>
      <p><strong>Title:</strong> {prototype.title}</p>
      <p><strong>Abstract:</strong> {prototype.abstract}</p>
      <p><strong>Student:</strong> {prototype.student?.email || "N/A"}</p>
      <p><strong>Approval Status:</strong> {prototype.status === "submitted_not_reviewed" ? "Submitted (Not Reviewed)" : "Submitted (Reviewed)"}</p>

      <label>Feedback:</label>
      <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} required />

      <button onClick={handleReview}>Submit Feedback</button>
      <button onClick={() => navigate("/dashboard")}>Cancel</button>
    </div>
  );
};

export default ReviewPrototype;
