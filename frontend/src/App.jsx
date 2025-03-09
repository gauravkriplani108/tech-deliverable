import "./App.css";
import icon from "./assets/quotebook.png";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
    // State variables for user's name and message
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

    // State variable for handling quotes from the api
    const [quotes, setQuotes] = useState([]);
    const [filter, setFilter] = useState("all"); // set to all by default

    // GET request from the api
    const getQuotes = async () => {
        try {
            const response = await axios.get(`/api/quote?max_age=${filter}`);
            setQuotes(response.data); // change the state to the data from api
        } catch (error) {
            console.error("Error retrieving quotes:", error);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // for not refreshing the page

        // Check if name and message are not empty
        if (!name.trim() || !message.trim()) {
            alert("Please enter both a name and a quote.");
            return;
        }

        try {
            // Create a FormData object for post_message to work
            const formData = new FormData();
            formData.append("name", name);
            formData.append("message", message);

            // POST request to the api
            await axios.post("/api/quote", formData, {
                headers: { "Content-Type": "multipart/form-data" }, // headers required for correct form submission
            });

            // Reset fields and call getQuotes to update the page
            setName("");
            setMessage("");
            getQuotes();
        } catch (error) {
            console.error(
                "Error submitting quote:",
                error.response?.data || error.message
            );
        }
    };

    // Get quotes on the page laod and when the filter changes
    useEffect(() => {
        getQuotes();
    }, [filter]);

    return (
        <div className="App">
            {/* Icon and title */}
            <img src={icon} alt="Quote Book Icon" className="quotebook-icon" />
            <h1>Hack at UCI Tech Deliverable</h1>

            {/* Form submission that doesn't refresh the page */}
            <h2>Submit a quote</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="input-name">Name</label>
                <input
                    type="text"
                    name="name"
                    id="input-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <label htmlFor="input-message">Quote</label>
                <input
                    type="text"
                    name="message"
                    id="input-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                />
                <button type="submit">Submit</button>
            </form>

            {/* Filter quotes dropdown */}
            <label htmlFor="filter">Show quotes from:</label>
            <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            >
                <option value="all">All time</option>
                <option value="week">Last week</option>
                <option value="month">Last month</option>
                <option value="year">Last year</option>
            </select>

            {/* Display previous quotes */}
            <h2>Previous Quotes</h2>
            <div className="messages">
                {quotes.length > 0 ? (
                    quotes.map((quote, index) => (
                        <div key={index} className="quote">
                            <p>
                                <strong>{quote.name}</strong>
                            </p>
                            <p>"{quote.message}"</p>
                            <p>{new Date(quote.time).toLocaleString()}</p>
                        </div>
                    ))
                ) : (
                    <p>No quotes posted yet.</p>
                )}
            </div>
        </div>
    );
}

export default App;
