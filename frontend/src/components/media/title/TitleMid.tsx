import React from 'react'

type TitleMidProps = {
    children: React.ReactNode;
    className?: string;
}

const TitleMid = ({ children, className }: TitleMidProps) => {
  return (
    <div className="flex flex-row items-stretch mb-6">
      <span className="mr-3 bg-gradient-to-b from-accent-primary to-accent-secondary w-1 rounded"></span>
      <h2 className={`text-2xl font-bold text-text-h1 ${className}`}>
        {children}
      </h2>
    </div>
  )
}

export default TitleMid