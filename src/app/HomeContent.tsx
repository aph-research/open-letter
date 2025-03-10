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
    position: '',
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
      [sig.name, sig.position, sig.honors]
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
        position: '',
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
            <h1 className="text-2xl md:text-4xl 2xl:text-5xl font-semibold tracking-normal" style={{lineHeight: "1.2"}}>
              Legal Access to Psychedelics to End the Agony of Cluster Headaches
            </h1>
            <h3 className="text-xl md:text-2xl 2xl:text-3xl font-semibold tracking-normal mt-4 md:mt-6 mb-[-2rem]" style={{lineHeight: "1.2"}}>
              An Open Letter
            </h3>
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
                      Cluster headaches are one of the most excruciatingly painful conditions known to medicine, compared by those suffering to having a red-hot ice pick driven into the eye. They are also called “suicide headaches” because some patients choose to end their lives to escape the pain. There is no known cure, and standard existing medical options are insufficient because they are unable to consistently prevent attacks from occurring, or rapidly abort every attack when needed over time. 
                    </p>
                    <p className="mb-4">
                      Many patients have reported having great success using certain psychedelics of the indoleamine chemical family, which interact with serotonin receptors. Psilocybin, LSD and also 5-MeO-DALT have been reported to be effective in preventing attacks, and DMT has been repeatedly reported to abort attacks within seconds and also have some preventative effects. These are not isolated anecdotes: hundreds of patients have reported these effects in published scientific surveys, some small-scale clinical trials support these claims, and limited use in normal clinical settings has also demonstrated the effectiveness. In patient support groups and in conferences organised by a major patient advocacy group, patients relate the successes they have had in ending their pain through the use of psychedelics. 
                    </p>
                    <p className="mb-4">
                      Based on an analysis of all the evidence, we have not a shadow of a doubt that these substances have medical value in preventing the excruciating pain of cluster headaches where other therapies have failed. Although caution must always be exercised when using psychedelics, which can have powerful effects at higher doses, they are also generally regarded as safe substances with low toxicity, based on decades of use, including in recreational contexts.
                    </p>
                    <p className="mb-4">
                      None of these substances has yet been approved for the medical treatment of cluster headaches. Conducting large-scale clinical trials is complicated by the difficulty to recruit patients with this relatively rare condition (though its prevalence is about the same as multiple sclerosis), and the lack of funding to study non-proprietary compounds. Their restricted status is an additional hurdle to running trials. 
                    </p>
                    <p className="mb-4">
                    Countries with compassionate use provisions can allow authorised physicians to prescribe these substances on a case-by-case basis. To our knowledge, Switzerland is the only country where physicians are regularly prescribing psilocybin and LSD to cluster headache patients – we have a case series submitted for publication documenting the positive results in one pain clinic. Canada has authorised one doctor to prescribe psilocybin for a cluster headache patient under its Special Access Program, but to date this has been an exception. We note that these substances are effective independently of their psychoactive effect, and that psychotherapy is not necessary as part of the treatment. 
                    </p>
                    <p className="mb-4">
                      Most patients who use these substances are forced to do so illegally, either growing their own psilocybin-containing mushrooms or obtaining mushrooms, LSD or DMT from other sources. The legal situation exposes these patients to potential criminal charges (ref - arrest), prevents them from obtaining substances of known purity and dosage, and makes patients wary to treat their cluster headaches with these substances, or to share relevant information publicly. The result is that many people suffer excruciating pain that could otherwise be treated. 
                    </p>
                    <p className="mb-4">
                    This situation requires urgent addressing. We call on governments everywhere to institute the following measures: 
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                      <li className="mb-2"><strong>Compassionate use provisions</strong>: Neurologists should be given the legal authorisation to prescribe psilocybin (including psilocybin-containing mushrooms and extracts), LSD and DMT to their cluster headache patients under compassionate use provisions, with a minimum of paperwork and bureaucracy. Neurologists should be informed of these provisions.</li>
                      <li className="mb-2"><strong>Health insurance</strong>: Medically prescribed psilocybin, LSD and DMT should be covered by health insurance, whether private or public.</li>
                      <li className="mb-2"><strong>Reduce costs</strong>: Efforts should be made to reduce the currently high costs of these substances when manufactured at pharmaceutical grade. The high costs can make these treatments unaffordable for patients who have to pay for them themselves, and reducing the costs would also reduce the burden if taken over by the health insurance system. In addition, lower-cost mushroom extracts containing precise concentrations of psilocybin should be made available.</li>
                      <li className="mb-2"><strong>Decriminalisation</strong>: No one with a cluster headache diagnosis who uses, obtains or seeks to obtain psychedelic substances to treat their condition should be subjectable to criminal charges or fines. Legislation should be passed to make this provision explicit. A more broadly compassionate, health-centered drug policy would, in fact, decriminalise all personal use of such substances, not just by cluster headache patients. However, our priority in this letter is to ensure that those who use these substances for this specific medical purpose are not criminalised.</li>
                      <li className="mb-2"><strong>Research</strong>: Large-scale clinical trials should be supported to compare the effectiveness of these substances with standard treatments, in order to facilitate eventual approval as standard treatments.</li>
                    </ul>
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
                          <div className="w-full px-2">
                            <label className="block text-gray-800 font-semibold mb-1">
                              Position(s) and Affiliation(s)
                            </label>
                            <input
                              type="text"
                              name="position"
                              value={formData.position}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 p-2 rounded"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-2">
                          <div className="w-full px-2">
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
                                {signatory.position}
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