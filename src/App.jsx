import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import coinAnimation from "./assets/coin-animation.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faCheck,
  faBookmark,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import "./index.css";

function App() {
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [completedTodos, setCompletedTodos] = useState(() => {
    const savedCompletedTodos = localStorage.getItem("completedTodos");
    return savedCompletedTodos ? JSON.parse(savedCompletedTodos) : [];
  });
  const [animatingTodos, setAnimatingTodos] = useState([]);
  const [input, setInput] = useState("");
  const [catGif, setCatGif] = useState("");
  const [coins, setCoins] = useState(() => {
    const savedCoins = localStorage.getItem("coins");
    return savedCoins ? parseInt(savedCoins, 10) : 0;
  });
  const [bookmarkedGifs, setBookmarkedGifs] = useState(() => {
    const saved = localStorage.getItem("bookmarkedGifs");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gifId = urlParams.get("gifId");
    if (gifId) {
      urlParams.delete("gifId");
      // window.location.replace("/");
    }
    fetchCatGif(gifId);
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("completedTodos", JSON.stringify(completedTodos));
  }, [completedTodos]);

  useEffect(() => {
    localStorage.setItem("coins", coins);
  }, [coins]);

  useEffect(() => {
    localStorage.setItem("bookmarkedGifs", JSON.stringify(bookmarkedGifs));
  }, [bookmarkedGifs]);

  const fetchCatGif = async (gifId) => {
    try {
      const endpoint = gifId
        ? `https://api.thecatapi.com/v1/images/${gifId}`
        : "https://api.thecatapi.com/v1/images/search?mime_types=gif";

      const response = await fetch(endpoint);
      const data = await response.json();

      const gifUrl = Array.isArray(data) ? data[0]?.url : data?.url;

      if (gifUrl) {
        setCatGif(gifUrl);
      }
    } catch (error) {
      console.error("Error fetching cat GIF:", error);
    }
  };

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, input.trim()]);
      setInput("");
    }
  };

  const completeTodo = (index) => {
    const completedTodo = todos[index];
    setAnimatingTodos([...animatingTodos, completedTodo]);
    setTodos(todos.filter((_, i) => i !== index));

    setTimeout(() => {
      setCompletedTodos([...completedTodos, completedTodo]);
      setAnimatingTodos(animatingTodos.filter((_, i) => i !== index));
      setCoins(coins + 1);
    }, 500);
  };

  const clearCompleted = () => {
    setCompletedTodos([]);
  };

  const deleteTodo = (index) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
    localStorage.setItem("todos", JSON.stringify(newTodos));
  };

  const handleBookmarkGif = () => {
    if (catGif && !bookmarkedGifs.includes(catGif)) {
      setBookmarkedGifs([...bookmarkedGifs, catGif]);
    }
  };

  const removeBookmark = (gifUrl) => {
    setBookmarkedGifs(bookmarkedGifs.filter((url) => url !== gifUrl));
  };

  const handleShareGif = async (gifUrl) => {
    try {
      const targetUrl = gifUrl || catGif;
      const gifId = targetUrl?.split("/").pop()?.split(".")[0] || "";
      const shareUrl = `${window.location.origin}${window.location.pathname}?gifId=${gifId}`;

      if (navigator.share) {
        await navigator.share({
          title: "Check out this cat GIF!",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Shareable link copied to clipboard!");
      }
    } catch (error) {
      console.error("Sharing failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center p-4 relative">
      <div className="bg-gray-200 p-6 rounded pixel-border w-full max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto">
        <h1 className="text-xl font-bold mb-4 text-center text-gray-900">
          Purrfect Tasks
        </h1>
        <div className="text-center mb-4 flex items-center justify-center space-x-2 bg-yellow-100 border-2 border-yellow-300 rounded-lg shadow-lg p-2">
          <div className="flex items-center justify-center">
            <Lottie
              animationData={coinAnimation}
              loop={true}
              style={{ height: "50px", width: "50px" }}
            />
          </div>
          <span className="text-lg font-bold text-gray-900">
            Coins: {coins}
          </span>
        </div>
        {catGif && (
          <div className="relative">
            <img
              src={catGif}
              alt="Random Cat"
              className="w-full h-48 object-cover rounded pixel-border mb-4"
            />
            <div className="absolute top-2 right-2 flex flex-col space-y-2">
              <button
                onClick={handleBookmarkGif}
                className="pixel-button p-1 rounded bg-white/80 hover:bg-white"
                title="Save this GIF"
              >
                <FontAwesomeIcon icon={faBookmark} className="text-gray-900" />
              </button>
              <button
                onClick={() => handleShareGif(catGif)}
                className="pixel-button p-1 rounded bg-white/80 hover:bg-white"
                title="Share this GIF"
              >
                <FontAwesomeIcon icon={faShare} className="text-gray-900" />
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            className="border p-2 flex-grow rounded pixel-border"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="New task"
          />
          <button
            onClick={addTodo}
            className="pixel-button text-gray-900 p-2 rounded"
          >
            Add
          </button>
        </div>
        <ul className="mb-4">
          {todos.map((todo, index) => (
            <li key={index} className="flex items-center mb-2">
              <span className="flex-grow">{todo}</span>
              <div className="flex space-x-2 ml-auto">
                <button
                  onClick={() => completeTodo(index)}
                  className="pixel-button text-gray-900 p-2 rounded"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button
                  onClick={() => deleteTodo(index)}
                  className="pixel-button text-gray-900 p-2 rounded"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </li>
          ))}
          {animatingTodos.map((todo, index) => (
            <li
              key={`animating-${index}`}
              className="flex justify-between items-center mb-2 completed-task"
            >
              <span>{todo}</span>
            </li>
          ))}
        </ul>
        {completedTodos.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-bold mb-2 text-gray-900">
              Completed Todos
            </h2>
            <ul className="mb-4">
              {completedTodos.map((todo, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center mb-2"
                >
                  <span>{todo}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={clearCompleted}
              className="pixel-button text-gray-900 p-2 rounded"
            >
              Clear Completed
            </button>
          </div>
        )}
        {bookmarkedGifs.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-bold mb-2 text-gray-900">
              Bookmarked GIFs
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {bookmarkedGifs.map((gif, index) => (
                <div key={index} className="relative">
                  <img
                    src={gif}
                    alt={`Bookmarked ${index}`}
                    className="rounded pixel-border w-full h-32 object-cover"
                  />
                  <div className="absolute top-0 right-0 flex flex-col space-y-1">
                    <button
                      onClick={() => handleShareGif(gif)}
                      className="pixel-button p-1 rounded bg-white/80 hover:bg-white"
                      title="Share this GIF"
                    >
                      <FontAwesomeIcon
                        icon={faShare}
                        className="text-gray-900 text-xs"
                      />
                    </button>
                    <button
                      onClick={() => removeBookmark(gif)}
                      className="pixel-button p-1 rounded bg-red-500/80 hover:bg-red-600"
                      title="Remove bookmark"
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="text-white text-xs"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="sm:absolute bottom-4 w-full text-center mt-4">
        <div className="text-gray-400 text-xs hover:text-gray-300 transition-colors">
          <a href="https://linktr.ee/igorfel">Developed by 🤖 Livingbots</a>
        </div>
      </div>
    </div>
  );
}

export default App;
