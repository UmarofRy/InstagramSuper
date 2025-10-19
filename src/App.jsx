import Navbar from './components/Navbar.jsx'
import AppRouter from './routes/AppRouter.jsx'
import Meta from './components/Meta.jsx'
import BottomNav from './components/BottomNav.jsx'
import './styles/App.css'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Meta />
      <main className="page-container">
        <AppRouter />
      </main>
      <BottomNav />
    </div>
  )
}
