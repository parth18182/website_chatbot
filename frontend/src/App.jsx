import { useState } from 'react';
import CrawlDashboard from './components/CrawlDashboard';
import ChatInterface from './components/ChatInterface'; 

function App() {
  const [activeUrl, setActiveUrl] = useState(null);

  return (
    <div>
      {!activeUrl ? (
        <CrawlDashboard onCrawlComplete={(url) => setActiveUrl(url)} />
      ) : (
        <ChatInterface 
          url={activeUrl} 
          onReset={() => setActiveUrl(null)} 
        />
      )}
    </div>
  );
}

export default App;