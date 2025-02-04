'use client'

import React, { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, Menu, Shield } from 'lucide-react'
import type { Signatory, FormData } from '@/app/types'

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [claimsNotable, setClaimsNotable] = useState(false)
  const [signatories, setSignatories] = useState<Signatory[]>([])
  const [filteredSignatories, setFilteredSignatories] = useState<Signatory[]>([])
  const [totalConfirmed, setTotalConfirmed] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    job_title: '',
    affiliation: '',
    honors: ''
  })

  // Fetch signatories
  // Fetch all signatories only once on component mount
  useEffect(() => {
    const fetchSignatories = async () => {
      try {
        const response = await fetch('/api/signatures')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received non-JSON response from server")
        }

        const data = await response.json() as Signatory[]
        setSignatories(data)
        setTotalConfirmed(data.length)
        setError(null)
      } catch (error) {
        console.error('Fetch error:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
        setSignatories([])
      }
    }

    fetchSignatories()
  }, [])

  // Filter signatories based on search term
  useEffect(() => {
    const filtered = signatories.filter(sig => 
      [sig.name, sig.job_title, sig.affiliation, sig.honors]
        .filter((field): field is string => field !== undefined && field !== null)
        .some(field => field.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredSignatories(filtered)
  }, [searchTerm, signatories])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isNotable: claimsNotable
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit signature')
      }

      setFormData({
        name: '',
        email: '',
        job_title: '',
        affiliation: '',
        honors: ''
      })
      setClaimsNotable(false)
      alert('Thank you for signing! Please check your email for verification.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit signature')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div style={{
        background: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 25%, #3b82f6 50%, #2563eb 75%, #1e40af 100%)',
        color: 'white'
      }}>
        {/* Navigation */}
        <nav className="px-6 md:px-12 py-4">
          <div className="container mx-auto flex justify-between items-center max-w-2xl 2xl:max-w-3xl">
            <a className="flex items-center hover:text-white" href="/">
              <Shield className="mr-2 shrink-0 text-5xl" />
              <h1 className="text-3xl font-serif mb-1">Open Letter</h1>
            </a>
            <div className="lg:hidden">
              <button aria-label="Toggle menu">
                <Menu className="w-6 h-6" />
              </button>
            </div>
            <div className="hidden lg:flex items-center">
              <a className="text-xl lg:text-base hover:text-blue-300 px-4 text-white" href="/about">
                About
              </a>
            </div>
          </div>
        </nav>

        {/* Header */}
        <header className="mx-auto flex flex-col mb-10 p-6 md:p-12">
          <div className="container mx-auto mt-2 mb-9 text-base md:text-lg border-l-4 border-white pl-4 max-w-2xl 2xl:max-w-3xl">
            <div className="max-w-2xl text-sm md:text-lg">
              <p>Your introduction text goes here...</p>
            </div>
          </div>
          <div className="container mx-auto max-w-2xl 2xl:max-w-3xl">
            <h1 className="text-3xl md:text-[52px] 2xl:text-[62px] font-semibold leading-tight tracking-tighter mb-[-1rem]">
              Your Open Letter Title
            </h1>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-12">
        <div className="container mx-auto mb-12">
          <div className="md:flex">
            <div className="h-full w-full flex justify-center">
              <div className="w-full max-w-2xl 2xl:max-w-3xl">
                {/* Letter Content */}
                <div className="border-b border-gray-700 mb-4">
                  <div className="max-w-2xl 2xl:max-w-3xl">
                    <p className="mb-4">
                      Your letter content goes here...
                    </p>
                  </div>
                </div>

                {/* Sign Form */}
                <div id="sign-form" className="pt-8 text-sm md:text-base">
                  <h2 className="text-2xl font-bold">Add your signature</h2>
                  <p className="text-gray-700 py-2">
                    Fill out this form to add your signature below. You will receive a confirmation email to verify your signature.
                  </p>
                  
                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="border border-gray-300 p-4 rounded mt-4">
                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                      <div className="space-y-4">
                        <div className="flex flex-wrap -mx-2">
                          <div className="w-full md:w-1/2 px-2">
                            <label className="block text-gray-800 font-semibold mb-1">
                              Full Name<span className="text-red-500"> *</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 p-2 rounded"
                              required
                            />
                          </div>
                          <div className="w-full md:w-1/2 px-2">
                            <label className="block text-gray-800 font-semibold mb-1">
                              Email<span className="text-red-500"> *</span>
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 p-2 rounded"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-2">
                          <div className="w-full md:w-1/2 px-2">
                            <label className="block text-gray-800 font-semibold mb-1">
                              Job Title / Position
                            </label>
                            <input
                              type="text"
                              name="job_title"
                              value={formData.job_title}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 p-2 rounded"
                            />
                          </div>
                          <div className="w-full md:w-1/2 px-2">
                            <label className="block text-gray-800 font-semibold mb-1">
                              Affiliation
                            </label>
                            <input
                              type="text"
                              name="affiliation"
                              value={formData.affiliation}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 p-2 rounded"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-2">
                          <div className="w-full md:w-1/2 px-2">
                            <label className="block text-gray-800 font-semibold mb-1">
                              Noteworthy Honors
                            </label>
                            <input
                              type="text"
                              name="honors"
                              value={formData.honors}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 p-2 rounded"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-800 font-semibold mb-1">Notable Signatory</p>
                          <input
                            type="checkbox"
                            id="claims_notable"
                            name="claims_notable"
                            className="mr-2 hover:cursor-pointer"
                            checked={claimsNotable}
                            onChange={(e) => setClaimsNotable(e.target.checked)}
                          />
                          <label htmlFor="claims_notable" className="text-sm hover:cursor-pointer select-none">
                            Check this box if you are a notable figure (AI scientist, executive, professor, leader, etc).
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-between mt-4">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`
                            flex items-center border border-gray-800 bg-blue-100 px-4 py-2 rounded
                            text-gray-800 font-semibold text-lg
                            hover:cursor-pointer hover:bg-blue-200
                            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          {isSubmitting ? 'Submitting...' : 'Sign'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Signatories Section */}
                <div id="signatories" className="pt-8">
                  <h2 className="text-2xl font-bold mb-4">Signatories</h2>
                  <div className="mb-4">
                    <div className="flex justify-between sm:justify-start mb-4">
                      <div className="bg-blue-100 px-4 py-2 rounded mr-4">
                        <p className="text-gray-800 md:text-base">Total confirmed</p>
                        <p className="text-xl md:text-3xl text-black font-semibold">
                          {totalConfirmed}
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative mb-2 w-full">
                      <input
                        type="text"
                        placeholder="Search signatories"
                        className="border border-gray-300 rounded p-2 pl-8 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search signatories"
                      />
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {isSearching ? (
                      <div className="text-center py-8">Searching...</div>
                    ) : (
                      <ul id="signatories-list" className="space-y-3 bg-gray-100 p-4 rounded">
                        {filteredSignatories.length > 0 ? (
                          filteredSignatories.map((signatory) => (
                            <li key={signatory.id} className="text-gray-800 flex flex-col">
                              <span className="flex items-center font-semibold text-base md:text-lg leading-tight">
                                {signatory.name}
                              </span>
                              <span className="text-sm md:text-base">
                                {signatory.job_title}
                                {signatory.affiliation && `, ${signatory.affiliation}`}
                                {signatory.honors && `, ${signatory.honors}`}
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-600 text-center py-4">
                            {searchTerm ? 'No signatories found matching your search' : 'No signatories yet'}
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home