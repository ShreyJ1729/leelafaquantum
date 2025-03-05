"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [urls, setUrls] = useState([]);
  const [nResults, setNResults] = useState(5);

  const base_url = "https://shreyj1729--leela-faquantum-rag.modal.run/";

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      // clear the response
      setResponse("");
      setIsLoading(true);

      // call url with ?question=searchQuery and n_results=10.
      // as the response is streaming in, continuosuly update the response variable.
      // Once the chunk coming in has the string "<END>", then save everything after that to the variable "urls"
      fetch(`${base_url}?question=${searchQuery}&n_results=${nResults}`)
        .then((response) => {
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("Response body is null");
          }
          const decoder = new TextDecoder();
          let partialResponse = "";

          const read = () => {
            return reader.read().then(({ done, value }) => {
              if (done) {
                return;
              }

              // Decode the new chunk of the response
              const chunk = decoder.decode(value, { stream: true });

              // Append the new chunk to the partial response
              partialResponse += chunk;

              // Check if the partial response contains the end string
              const endStringIndex = partialResponse.indexOf("<END>");
              if (endStringIndex !== -1) {
                // Save the urls
                const new_urls = partialResponse.slice(endStringIndex + 5);
                setUrls(new_urls.split("\n"));
                console.log(new_urls);

                // Update the response with the partial response
                setResponse(partialResponse.slice(0, endStringIndex));
              } else {
                // Update the response with the partial response
                setResponse(partialResponse);
              }

              // Continue reading
              return read();
            });
          };

          // Start reading the response
          return read();
        })
        .catch((error) => {
          console.error(error);
          setResponse("An error occurred while fetching the results.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const ResultItem = (url) => (
    <div className="flex gap-4 mb-6" key={url}>
      <iframe
        width="560"
        height="315"
        src={url}
        title=""
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>

      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-2">Sample Title</h3>
        <p className="text-gray-600">{url}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white px-6 py-4">
      {/* Navigation */}
      <nav className="flex justify-between items-center mb-32">
        <h1 className="text-2xl font-bold">Leela FAQuantum</h1>
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
          >
            Sign Up
          </a>
          <button className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200">
            Login
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-bold mb-6">
          Get Answers to Telegram FAQs
        </h2>
        <p className="text-gray-600 text-xl mb-8">
          Get results from K Elmer&lsquo;s YouTube channel
        </p>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="What is the difference between H.E.A.L. and H.E.A.L. 360?"
            className="w-full px-6 py-4 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
        {/* Number of Results Slider */}
        <div className="mb-8 mt-0 w-1/3 mx-auto text-center">
          <label
            htmlFor="nResults"
            className="block mb-2 text-lg font-medium text-gray-700"
          >
            Number of videos to synthesize: {nResults}
          </label>
          <input
            type="range"
            id="nResults"
            name="nResults"
            min="1"
            max="10"
            value={nResults}
            onChange={(e) => setNResults(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Loading Bar */}
        {isLoading && (
          <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
            <div
              className="h-full bg-indigo-600 rounded-full animate-[loading_2s_ease-in-out_infinite]"
              style={{
                width: "100%",
                animation: "loading 2s ease-in-out infinite",
              }}
            ></div>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && (
          <div className="text-left">
            {/* Main Result Box */}
            <div className="bg-gray-100 p-6 rounded-lg mb-8">
              <div className="prose">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </div>

            {/* Result Items */}
            <div className="space-y-6">
              {/* map urls */}
              {urls.map((url) =>
                ResultItem(
                  url.replace("watch?v=", "embed/").replace("&t=", "?start=")
                )
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
