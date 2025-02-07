'use client'

import Link from 'next/link'
import React from 'react'
import { HeartHandshake } from 'lucide-react'
const headerStyle = {
  backgroundImage: `linear-gradient(45deg, #00ff66 0%, #6600ff 50%, #0066ff 100%),
                       linear-gradient(135deg, transparent 0%, #33ffff99 50%, transparent 100%)`,
  backgroundAttachment: 'fixed',
  backgroundBlendMode: 'overlay',
  color: 'white'
}

export function AboutContent() {

  return (
    <div className="min-h-screen bg-white text-black">
      <div style={headerStyle}>
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
        <header className="mx-auto flex flex-col mb-10 pt-24 pb-12 px-6 md:pt-32 md:pb-16 md:px-12 justify-end">
          <div className="container mx-auto max-w-2xl 2xl:max-w-3xl">
            <h1 className="text-2xl md:text-4xl 2xl:text-5xl font-semibold tracking-tighter mb-[-1rem]" style={{lineHeight: "1.2"}}>
              About This Initiative
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
                <div className="space-y-6">
                  <p>
                    This initiative is led by…
                  </p>
                  <p>
                    If you would like to get involved, get in touch at…
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}