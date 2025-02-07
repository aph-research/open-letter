'use client'

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, HeartHandshake } from 'lucide-react'
import type { Signatory, FormData } from '@/app/types'
import { GradientGenerator } from '@/components/GradientGenerator'
import type { GradientStyle } from '@/app/types/gradient'
import { FootnoteReference, FootnotesSection } from '@/components/Footnotes'


const defaultGradient: GradientStyle = {
  backgroundImage: `linear-gradient(45deg, #00ff66 0%, #6600ff 50%, #0066ff 100%),
                       linear-gradient(135deg, transparent 0%, #33ffff99 50%, transparent 100%)`,
  backgroundAttachment: 'fixed',
  backgroundBlendMode: 'overlay',
  color: 'white'
}

export function HomeContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [claimsNotable, setClaimsNotable] = useState(false)
  const [signatories, setSignatories] = useState<Signatory[]>([])
  const [filteredSignatories, setFilteredSignatories] = useState<Signatory[]>([])
  const [totalConfirmed, setTotalConfirmed] = useState(0)
  const [isSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    job_title: '',
    affiliation: '',
    honors: ''
  })
  const [headerGradient, setHeaderGradient] = useState<GradientStyle>(defaultGradient)

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
        console.log('Fetched signatures:', data)  // Added debug log
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

  const [footnotes] = useState([
    {
      number: 1,
      content: "Your first footnote content goes here"
    },
    {
      number: 2,
      content: "Your second footnote content goes here"
    }
  ]);

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
      <div style={headerGradient}>
        {/* Navigation */}
        <nav className="px-6 md:px-12 py-4">
          <div className="container mx-auto flex justify-between items-center max-w-2xl 2xl:max-w-3xl">
            <Link className="flex items-center hover:text-white" href="/">
              <HeartHandshake className="mr-2 shrink-0" size={40} />
            </Link>
            <div className="flex items-center gap-4">
              <Link className="text-xl lg:text-base hover:text-blue-300 px-4 text-white" href="/about">
                About
              </Link>
            </div>
          </div>
        </nav>

        {/* Header */}
        <header className="mx-auto flex flex-col mb-10 pt-24 pb-12 px-6 md:pt-32 md:pb-16 md:px-12 justify-end relative">
          <div className="container mx-auto max-w-2xl 2xl:max-w-3xl">
            <h1 className="text-2xl md:text-4xl 2xl:text-5xl font-semibold tracking-normal mb-[-1rem]" style={{lineHeight: "1.2"}}>
              Addressing Neglected Human Suffering: A Joint Appeal
            </h1>
            <div className="absolute bottom-4 right-6 md:right-12 flex gap-2">
              <GradientGenerator onGradientChange={setHeaderGradient} />
            </div>
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
                      Lorem ipsum dolor sit amet,<FootnoteReference number={1}/> consectetur adipiscing elit.<FootnoteReference number={2}/> Maecenas interdum pellentesque justo sodales condimentum. Mauris vitae tellus odio. Proin fermentum elit ultrices, mattis lacus dictum, dapibus justo. Vestibulum a odio cursus odio fringilla sagittis aliquam at sapien. Suspendisse nunc nunc, mollis vitae posuere at, bibendum sit amet justo. Donec ac est sed tortor lacinia cursus at quis nibh. Duis interdum ex eros, id efficitur libero sodales vitae.
                    </p>
                    <p className="mb-4">
                      Nulla sit amet maximus eros, sed accumsan odio. Aliquam eget leo non dolor vehicula fringilla sit amet in tortor. Nunc eget lectus sed tortor auctor consequat sed ut tellus. Nam eu tempus mauris. Donec in dui ut turpis scelerisque accumsan sed vel justo. Etiam ac venenatis tellus. Pellentesque maximus ullamcorper nulla, vel efficitur tortor. Cras eu viverra orci.
                    </p>
                    <p className="mb-4">
                      Vivamus vel accumsan augue. Morbi sit amet semper eros. Suspendisse bibendum nulla purus, sit amet tristique sem pharetra id. Donec faucibus nulla sed pharetra facilisis. In hac habitasse platea dictumst. Donec a arcu nec tortor mollis accumsan non vel urna. Nunc volutpat nibh vel turpis fermentum eleifend. Ut posuere est efficitur eros auctor, in vestibulum elit euismod. Nullam lobortis elit orci, vitae suscipit arcu elementum non. In tempus turpis risus, sit amet ullamcorper nunc laoreet ut. Vivamus neque ante, viverra at enim id, eleifend pharetra libero.
                    </p>
                    <p className="mb-4">
                      Nulla porta, nulla ut sagittis iaculis, nisi nibh volutpat mi, vitae ultricies tortor ipsum nec justo. Suspendisse eu ante nec purus suscipit semper. In accumsan eros a odio fermentum pharetra. Suspendisse vel massa velit. Maecenas sed lacinia lacus. Mauris ultricies fringilla quam at porta. Curabitur placerat, mi ut volutpat ultricies, est mauris consectetur ex, ut fermentum sapien lectus in diam. Nulla at est efficitur risus sodales lobortis. Sed tempor erat vel felis eleifend, eget ultrices nibh rhoncus. Morbi ornare iaculis est non bibendum.
                    </p>
                    <p className="mb-4">
                      Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In malesuada quis tellus quis commodo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc imperdiet metus id consequat scelerisque. Nam sed justo lorem. Maecenas ut arcu pharetra, malesuada lacus vehicula, sodales metus. Nunc eu tempor magna, non luctus velit. Aliquam erat volutpat.
                    </p>
                  </div>
                </div>

                {/* Footnotes Section */}
                <div className="md:flex">
                  <div className="max-w-2xl 2xl:max-w-3xl">
                    <FootnotesSection footnotes={footnotes} />
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