import React from 'react'

type TitleMidProps = {
    children: React.ReactNode;
    className?: string;
}

const TitleMid = ({ children, className }: TitleMidProps) => {
  return (
    <div className="flex flex-row items-stretch mb-4 ">
      <span className="mr-2 bg-gradient-to-b from-accent-primary to-accent-secondary w-1 rounded"></span>
      <h2 className={`text-2xl font-semibold ${className}`}>
        {children}
      </h2>
    </div>
  )
}

export default TitleMid