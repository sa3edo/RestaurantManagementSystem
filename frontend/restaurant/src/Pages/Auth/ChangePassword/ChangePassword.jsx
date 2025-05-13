import React, { useState } from "react";
import Swal from "sweetalert2";
import {jwtDecode} from "jwt-decode"; // Corrected import for jwt-decode
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Decode the JWT token to get the userId
    const getUserIdFromToken = () => {
        const token = localStorage.getItem("token"); // Get token from localStorage
        if (!token) {
            console.log("No token found in localStorage");
            return null;
        }

        try {
            const decoded = jwtDecode(token); // Decode the JWT token
            console.log("Decoded Token:", decoded); // Log decoded token to verify the structure

            // Extract userId from 'nameidentifier'
            return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        } catch (error) {
            console.error("Invalid token:", error);
            return null;
        }
    };

    const userId = getUserIdFromToken(); // Retrieve the userId from the token

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation: check if userId, currentPassword, or newPassword is missing
        if (!userId || !currentPassword || !newPassword) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Please fill out all fields and make sure you're logged in!",
            });
            return;
        }

        try {
            // Prepare the request payload
            const requestData = {
                userId: String(userId),
                currentPassword: String(currentPassword),
                newPassword: String(newPassword),
            };

            // Get the token from localStorage
            const token = localStorage.getItem("token");

            // Send the API request with the token in the Authorization header
            const response = await axios.put(
                "https://localhost:7251/api/Account/ChangeCurrentPassword", // Replace with actual API endpoint
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Send the token in the Authorization header
                    },
                }
            );

            // Log the response to understand its structure
            console.log("Backend response:", response);
            console.log("Backend response data:", response.data);

            // Check for validation errors (e.g., password complexity errors)
            if (response.data.errors && response.data.errors.length > 0) {
                // Handle password validation errors
                let errorMessage = response.data.errors.join("\n"); // Join the errors into a single string
                Swal.fire({
                    icon: "error",
                    title: "Password Validation Error",
                    text: errorMessage, // Display the validation errors
                });
            } else if (response.status === 200) {
                // Handle success if the response is successful
                Swal.fire({
                    icon: "success",
                    title: "Password Changed!",
                    text: "Your password has been successfully updated.",
                });
            } else {
                // Handle generic errors
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.data.message || "Something went wrong!",
                });
            }
        } catch (error) {
            console.error("Error changing password:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred, please try again.",
            });
        }
    };

    return (
        <div className="container mt-5">
            <h2>Change Password</h2>
            <form onSubmit={handleSubmit} className="form-group">
                <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">
                        Current Password
                    </label>
                    <input
                        type="password"
                        id="currentPassword"
                        className="form-control"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                        New Password
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Change Password
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;
