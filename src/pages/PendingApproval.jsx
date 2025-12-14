import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Clock, CheckCircle } from 'lucide-react'

const PendingApproval = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If user is approved, redirect to dashboard
    if (currentUser && currentUser.status === 'approved') {
      navigate('/')
    }
  }, [currentUser, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <Clock className="w-8 h-8 text-yellow-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Pending Approval</h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for registering! Your account is currently pending approval by an administrator.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm text-blue-800 font-medium mb-1">What happens next?</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• An admin will review your registration</li>
                <li>• You'll receive access once approved</li>
                <li>• Check back later or contact support</li>
              </ul>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}

export default PendingApproval

