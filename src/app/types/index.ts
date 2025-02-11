// API response type (what gets sent to the client)
export interface Signatory {
  id: number
  name: string
  email: string
  position?: string
  honors?: string
  status: 'pending' | 'verified' | 'rejected'
  created_at: string
  verified_at?: string
  is_notable?: boolean
}

// Database type (internal use)
export interface Signature {
  id: number
  name: string
  email: string
  position?: string
  honors?: string
  status: 'pending' | 'verified' | 'rejected'
  created_at: Date
  verified_at?: Date
  is_notable?: boolean
  verification_token?: string
}

// Request type for creating a signature
export interface CreateSignatureRequest {
  name: string
  email: string
  position?: string
  honors?: string
  isNotable?: boolean
  verification_token?: string
  status?: 'pending' | 'verified' | 'rejected'
}

// Form data type
export interface FormData {
  name: string
  email: string
  position: string
  honors: string
}