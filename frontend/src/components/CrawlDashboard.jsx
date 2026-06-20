import { useState } from 'react';
import axios from 'axios';
import { Globe, Loader2, ArrowRight } from 'lucide-react';

export default function CrawlDashboard({ onCrawlComplete }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCrawl = async (e) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/crawl', { url });
      
      if (response.status === 200) {
        onCrawlComplete(url); 
      }
    } catch (err) {
      setError('Failed to crawl website. Make sure the URL is correct and the backend is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 text-center border border-gray-100">
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Feed the AI a Website</h1>
          <p className="text-gray-500">Paste any URL below. We'll read it, map it, and make it chat-ready in seconds.</p>
        </div>

        <form onSubmit={handleCrawl} className="space-y-4">
          <div className="relative">
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              required
              className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-left px-2">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || !url}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing Website...
              </>
            ) : (
              <>
                Go To ChatBot <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}