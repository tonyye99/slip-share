import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'

const Index = () => {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with theme toggle and sign out */}
      <div className="flex justify-between items-center p-4">
        <div className="text-sm text-muted-foreground">
          Welcome, {user.email}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign Out
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold mb-4">Receipt Scanner</h1>
          <p className="text-xl text-muted-foreground">
            Upload and scan your receipts with OCR
          </p>
          <Button asChild size="lg">
            <Link to="/upload-receipt">Upload Receipt</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Index
