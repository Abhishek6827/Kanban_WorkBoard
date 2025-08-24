"use client";

import { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const TestConnection = () => {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const { token } = useAuth();

  const testAPI = async () => {
    setStatus("Testing...");
    setError("");

    try {
      console.log("API URL:", import.meta.env.VITE_API_URL);
      console.log("Token:", token);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/`);
      setStatus(`✅ API Connected! Response: ${JSON.stringify(response.data)}`);
    } catch (err) {
      setError(`❌ API Error: ${err.message}`);
      console.error("API Error:", err);
    }
  };

  const testAuth = async () => {
    setStatus("Testing authentication...");
    setError("");

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/me/`,
        {
          headers: {
            Authorization: token ? `Token ${token}` : "",
          },
        }
      );
      setStatus(
        `✅ Authentication working! User: ${JSON.stringify(response.data)}`
      );
    } catch (err) {
      setError(
        `❌ Auth Error: ${err.response?.status} - ${
          err.response?.data?.error || err.message
        }`
      );
      console.error("Auth Error:", err);
    }
  };

  const testBoards = async () => {
    setStatus("Testing boards endpoint...");
    setError("");

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/boards/`,
        {
          headers: {
            Authorization: token ? `Token ${token}` : "",
          },
        }
      );
      setStatus(
        `✅ Boards endpoint working! Found ${response.data.length} boards`
      );
    } catch (err) {
      setError(
        `❌ Boards Error: ${err.response?.status} - ${
          err.response?.data?.error || err.message
        }`
      );
      console.error("Boards Error:", err);
    }
  };

  const testTaskStatusUpdate = async () => {
    setStatus("Testing task status update...");
    setError("");

    try {
      // First get boards to find a task
      const boardsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/boards/`,
        {
          headers: {
            Authorization: token ? `Token ${token}` : "",
          },
        }
      );

      if (boardsResponse.data.length === 0) {
        setError("❌ No boards found. Create a board first.");
        return;
      }

      const board = boardsResponse.data[0];
      if (!board.tasks || board.tasks.length === 0) {
        setError("❌ No tasks found. Create a task first.");
        return;
      }

      const task = board.tasks[0];
      const newStatus = task.status === "To-Do" ? "In Progress" : "To-Do";

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/tasks/${task.id}/status/`,
        { status: newStatus },
        {
          headers: {
            Authorization: token ? `Token ${token}` : "",
          },
        }
      );

      setStatus(
        `✅ Task status update working! Updated task ${task.id} from ${task.status} to ${newStatus}`
      );
    } catch (err) {
      setError(
        `❌ Task Status Update Error: ${err.response?.status} - ${
          err.response?.data?.error || err.message
        }`
      );
      console.error("Task Status Update Error:", err);
    }
  };

  const testDragAndDrop = () => {
    setStatus("Testing drag and drop setup...");
    setError("");

    try {
      // Check if react-beautiful-dnd is available
      if (typeof window !== "undefined" && window.ReactBeautifulDnd) {
        setStatus("✅ react-beautiful-dnd is loaded and available");
      } else {
        setError(
          "❌ react-beautiful-dnd not found. Check if it's properly installed."
        );
      }
    } catch (err) {
      setError(`❌ Drag and Drop Test Error: ${err.message}`);
    }
  };

  const testSimpleDragAndDrop = () => {
    setStatus("Testing simple HTML5 drag and drop...");
    setError("");

    try {
      // Test if HTML5 drag and drop is supported
      if ("draggable" in document.createElement("div")) {
        setStatus("✅ HTML5 drag and drop is supported by your browser");
      } else {
        setError("❌ HTML5 drag and drop is not supported by your browser");
      }
    } catch (err) {
      setError(`❌ HTML5 Drag and Drop Test Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          API Connection & Functionality Test
        </h1>

        <div className="space-y-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Environment Variables:</h3>
            <p>
              <strong>VITE_API_URL:</strong>{" "}
              {import.meta.env.VITE_API_URL || "Not set"}
            </p>
            <p>
              <strong>Token:</strong> {token ? "Present" : "Not found"}
            </p>
            <p>
              <strong>User Agent:</strong> {navigator.userAgent}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={testAPI}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Test API Connection
          </button>

          <button
            onClick={testAuth}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Test Authentication
          </button>

          <button
            onClick={testBoards}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
          >
            Test Boards Endpoint
          </button>

          <button
            onClick={testTaskStatusUpdate}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
          >
            Test Task Status Update (Drag & Drop Backend)
          </button>

          <button
            onClick={testDragAndDrop}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Test react-beautiful-dnd Library
          </button>

          <button
            onClick={testSimpleDragAndDrop}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Test HTML5 Drag & Drop Support
          </button>
        </div>

        {status && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{status}</p>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Troubleshooting Tips:</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Make sure Django backend is running on port 8000</li>
            <li>• Check browser console for JavaScript errors</li>
            <li>• Ensure you're logged in with a valid token</li>
            <li>• Try refreshing the page if drag and drop doesn't work</li>
            <li>• Check if react-beautiful-dnd is properly imported</li>
            <li>
              • The app now has a fallback HTML5 drag and drop if
              react-beautiful-dnd fails
            </li>
            <li>• Open browser console to see drag and drop debug logs</li>
          </ul>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Quick Test:</h3>
          <p className="text-sm text-blue-800 mb-2">
            Try this simple drag and drop test:
          </p>
          <div className="flex space-x-4">
            <div
              className="w-20 h-20 bg-red-200 border-2 border-dashed border-red-400 flex items-center justify-center cursor-grab"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", "test");
                console.log("Drag started");
              }}
            >
              Drag Me
            </div>
            <div
              className="w-20 h-20 bg-green-200 border-2 border-dashed border-green-400 flex items-center justify-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                console.log("Dropped!");
                alert("Drag and drop is working!");
              }}
            >
              Drop Here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;
