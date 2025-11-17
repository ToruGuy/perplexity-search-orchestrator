import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/lib/app-context'
import { Toaster } from '@/components/ui/sonner'
import Nav from '@/components/nav'
import Header from '@/components/header'

// Route components - to be created
import Home from '@/routes/Home'
import TopicNew from '@/routes/TopicNew'
import TopicDetails from '@/routes/TopicDetails'
import TopicEdit from '@/routes/TopicEdit'
import History from '@/routes/History'
import ResultDetails from '@/routes/ResultDetails'
import Settings from '@/routes/Settings'

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex h-screen bg-background">
          {/* Sidebar Navigation */}
          <Nav />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header />
            
            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/topics/new" element={<TopicNew />} />
                <Route path="/topics/:id" element={<TopicDetails />} />
                <Route path="/topics/:id/edit" element={<TopicEdit />} />
                <Route path="/history" element={<History />} />
                <Route path="/results/:id" element={<ResultDetails />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </div>
        
        {/* Toast Notifications */}
        <Toaster />
      </Router>
    </AppProvider>
  )
}

export default App

